const supabase = require('../config/supabase');
const { calculateDistance } = require('../utils/gpsHelper');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile } = require('../services/storageService');

// Ambil agenda absensi GPS yang aktif
const getCurrentActivity = async (req, res, next) => {
  try {
    const { data: agenda, error } = await supabase
      .from('agenda_absensi')
      .select('*')
      .eq('status', 'aktif')
      .order('tanggal', { ascending: false })
      .order('jam_mulai', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    if (!agenda) {
      return sendError(res, 'Tidak ada kegiatan aktif saat ini.', 404);
    }

    return sendSuccess(res, 'Kegiatan aktif ditemukan.', {
      id: agenda.id,
      name: agenda.judul,
      latitude: agenda.latitude,
      longitude: agenda.longitude,
      radius: Math.round(agenda.radius),
      locationName: 'Pangkalan SMPN 2 Katapang',
      timeRange: `${agenda.jam_mulai} - ${agenda.jam_selesai}`
    });
  } catch (error) {
    next(error);
  }
};

// Ambil status absensi siswa untuk agenda aktif
const getAttendanceStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Ambil data siswa
    const { data: siswa, error: siswaErr } = await supabase
      .from('siswa')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (siswaErr || !siswa) {
      return sendSuccess(res, 'Status absensi berhasil diambil.', {
        status: 'Belum Check In',
        checkInTime: null
      });
    }

    // Cari agenda yang aktif
    const { data: agenda } = await supabase
      .from('agenda_absensi')
      .select('id')
      .eq('status', 'aktif')
      .order('tanggal', { ascending: false })
      .order('jam_mulai', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!agenda) {
      return sendSuccess(res, 'Status absensi berhasil diambil.', {
        status: 'Belum Check In',
        checkInTime: null
      });
    }

    // Periksa riwayat absen
    const { data: absensi, error } = await supabase
      .from('absensi')
      .select('created_at, status, keterangan')
      .eq('siswa_id', siswa.id)
      .eq('agenda_id', agenda.id)
      .maybeSingle();

    if (error) throw error;

    if (absensi) {
      let statusStr = 'Sudah Check In';
      if (absensi.status === 'IZIN') statusStr = 'Izin';
      else if (absensi.status === 'SAKIT') statusStr = 'Sakit';
      else if (absensi.status === 'ALFA') statusStr = 'Alfa';

      let formattedTime = null;
      if (absensi.created_at) {
        const d = new Date(absensi.created_at);
        formattedTime = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      }

      return sendSuccess(res, 'Status absensi berhasil diambil.', {
        status: statusStr,
        checkInTime: formattedTime
      });
    }

    return sendSuccess(res, 'Status absensi berhasil diambil.', {
      status: 'Belum Check In',
      checkInTime: null
    });
  } catch (error) {
    next(error);
  }
};

// Absensi GPS & Selfie Siswa
const checkIn = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { latitude, longitude, accuracy, kegiatanId } = req.body;

    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    const agendaId = parseInt(kegiatanId);

    // Ambil data siswa
    const { data: siswa, error: siswaErr } = await supabase
      .from('siswa')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (siswaErr || !siswa) {
      return sendError(res, 'Profil siswa tidak ditemukan.', 404);
    }

    // Ambil data agenda
    const { data: agenda, error: agendaErr } = await supabase
      .from('agenda_absensi')
      .select('*')
      .eq('id', agendaId)
      .maybeSingle();

    if (agendaErr || !agenda) {
      return sendError(res, 'Agenda absensi tidak ditemukan.', 404);
    }

    // Validasi jarak lokasi
    const distance = calculateDistance(latVal, lngVal, agenda.latitude, agenda.longitude);

    if (distance > agenda.radius) {
      return sendError(
        res,
        `Anda berada di luar radius absensi. (Jarak Anda: ${distance.toFixed(1)} meter, Maksimal: ${agenda.radius} meter)`,
        400
      );
    }

    // Unggah foto selfie
    let selfieUrl = null;
    if (req.file) {
      try {
        selfieUrl = await uploadFile(req.file, 'kegiatan');
      } catch (err) {
        console.error("Selfie upload failed:", err.message);
      }
    }

    // Simpan atau update absensi
    const { data: existing } = await supabase
      .from('absensi')
      .select('id')
      .eq('siswa_id', siswa.id)
      .eq('agenda_id', agenda.id)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('absensi')
        .update({
          latitude: latVal,
          longitude: lngVal,
          jarak: parseFloat(distance.toFixed(2)),
          foto_absen: selfieUrl || undefined,
          status: 'HADIR',
          keterangan: 'Absensi GPS Android'
        })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('absensi')
        .insert([{
          siswa_id: siswa.id,
          agenda_id: agenda.id,
          latitude: latVal,
          longitude: lngVal,
          jarak: parseFloat(distance.toFixed(2)),
          foto_absen: selfieUrl,
          status: 'HADIR',
          keterangan: 'Absensi GPS Android'
        }])
        .select('*')
        .single();
      if (error) throw error;
      result = data;
    }

    return sendSuccess(res, 'Absensi selfie berhasil disimpan.', result, 201);
  } catch (error) {
    next(error);
  }
};

// Kirim permohonan izin/sakit
const submitPermit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { kegiatanId, reason, type } = req.body;

    const agendaId = parseInt(kegiatanId);

    // Ambil data siswa
    const { data: siswa, error: siswaErr } = await supabase
      .from('siswa')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (siswaErr || !siswa) {
      return sendError(res, 'Profil siswa tidak ditemukan.', 404);
    }

    // Ambil data agenda
    const { data: agenda, error: agendaErr } = await supabase
      .from('agenda_absensi')
      .select('*')
      .eq('id', agendaId)
      .maybeSingle();

    if (agendaErr || !agenda) {
      return sendError(res, 'Agenda absensi tidak ditemukan.', 404);
    }

    // Unggah dokumen surat izin jika ada
    let docUrl = null;
    if (req.file) {
      try {
        docUrl = await uploadFile(req.file, 'kegiatan');
      } catch (err) {
        console.error("Document upload failed:", err.message);
      }
    }

    // Simpan surat izin
    const { data: existing } = await supabase
      .from('absensi')
      .select('id')
      .eq('siswa_id', siswa.id)
      .eq('agenda_id', agenda.id)
      .maybeSingle();

    const statusVal = (type || 'IZIN').toUpperCase();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('absensi')
        .update({
          latitude: 0,
          longitude: 0,
          jarak: 0,
          foto_absen: docUrl || undefined,
          status: statusVal,
          keterangan: reason || `Izin ketidakhadiran: ${type}`
        })
        .eq('id', existing.id)
        .select('*')
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('absensi')
        .insert([{
          siswa_id: siswa.id,
          agenda_id: agenda.id,
          latitude: 0,
          longitude: 0,
          jarak: 0,
          foto_absen: docUrl,
          status: statusVal,
          keterangan: reason || `Izin ketidakhadiran: ${type}`
        }])
        .select('*')
        .single();
      if (error) throw error;
      result = data;
    }

    return sendSuccess(res, 'Permohonan izin berhasil dikirim.', result, 201);
  } catch (error) {
    next(error);
  }
};

// Ambil riwayat absen hari ini
const getTodayAttendance = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Ambil data siswa
    const { data: siswa } = await supabase
      .from('siswa')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!siswa) {
      return sendSuccess(res, 'Data absensi hari ini kosong.', null);
    }

    const today = new Date().toISOString().split('T')[0];

    const { data: logs, error } = await supabase
      .from('absensi')
      .select('*, agenda_absensi(*)')
      .eq('siswa_id', siswa.id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lte('created_at', `${today}T23:59:59.999Z`);

    if (error) throw error;

    return sendSuccess(res, 'Data absensi hari ini berhasil diambil.', logs || null);
  } catch (error) {
    next(error);
  }
};

// Verifikasi foto selfie wajah
const selfieVerification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { activityId, attendanceId, latitude, longitude } = req.body;

    const latVal = parseFloat(latitude);
    const lngVal = parseFloat(longitude);
    const agendaId = parseInt(activityId);

    // Ambil data siswa aktif
    const { data: siswa, error: siswaErr } = await supabase
      .from('siswa')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (siswaErr || !siswa) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Profil siswa tidak ditemukan.'
      });
    }

    // Ambil agenda aktif
    const { data: agenda, error: agendaErr } = await supabase
      .from('agenda_absensi')
      .select('*')
      .eq('id', agendaId)
      .maybeSingle();

    if (agendaErr || !agenda) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Agenda absensi tidak ditemukan.'
      });
    }

    // Hitung jarak lokasi
    const distance = calculateDistance(latVal, lngVal, agenda.latitude, agenda.longitude);

    if (distance > agenda.radius) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: `Anda berada di luar radius absensi. (Jarak Anda: ${distance.toFixed(1)} meter, Maksimal: ${agenda.radius} meter)`
      });
    }

    // Unggah foto selfie ke storage
    let selfieUrl = null;
    if (req.file) {
      try {
        selfieUrl = await uploadFile(req.file, 'kegiatan');
      } catch (err) {
        console.error("Selfie upload failed:", err.message);
      }
    }

    if (!selfieUrl) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Gagal mengunggah foto selfie verifikasi.'
      });
    }

    // Simpan data absen
    const { data: existing } = await supabase
      .from('absensi')
      .select('id')
      .eq('siswa_id', siswa.id)
      .eq('agenda_id', agenda.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('absensi')
        .update({
          latitude: latVal,
          longitude: lngVal,
          jarak: parseFloat(distance.toFixed(2)),
          foto_absen: selfieUrl,
          status: 'HADIR',
          keterangan: 'Verifikasi Wajah Android'
        })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('absensi')
        .insert([{
          siswa_id: siswa.id,
          agenda_id: agenda.id,
          latitude: latVal,
          longitude: lngVal,
          jarak: parseFloat(distance.toFixed(2)),
          foto_absen: selfieUrl,
          status: 'HADIR',
          keterangan: 'Verifikasi Wajah Android'
        }]);
      if (error) throw error;
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Verifikasi wajah berhasil. Absensi tercatat.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCurrentActivity,
  getAttendanceStatus,
  checkIn,
  submitPermit,
  getTodayAttendance,
  selfieVerification
};

const AbsensiModel = require('../models/absensiModel');
const SiswaModel = require('../models/siswaModel');
const AgendaModel = require('../models/agendaModel');
const { calculateDistance } = require('../utils/gpsHelper');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile } = require('../services/storageService');

// Ambil agenda absensi GPS yang aktif
const getCurrentActivity = async (req, res, next) => {
  try {
    const agenda = await AgendaModel.findFirstActive();

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
    const siswa = await SiswaModel.findByUserId(userId);

    if (!siswa) {
      return sendSuccess(res, 'Status absensi berhasil diambil.', {
        status: 'Belum Check In',
        checkInTime: null
      });
    }

    // Cari agenda yang aktif
    const agenda = await AgendaModel.findFirstActive();

    if (!agenda) {
      return sendSuccess(res, 'Status absensi berhasil diambil.', {
        status: 'Belum Check In',
        checkInTime: null
      });
    }

    // Periksa riwayat absen
    const absensi = await AbsensiModel.findSpecificAbsensi(siswa.id, agenda.id);

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
    const siswa = await SiswaModel.findByUserId(userId);

    if (!siswa) {
      return sendError(res, 'Profil siswa tidak ditemukan.', 404);
    }

    // Ambil data agenda
    const agenda = await AgendaModel.findById(agendaId);

    if (!agenda) {
      return sendError(res, 'Agenda absensi tidak ditemukan.', 404);
    }

    // Deteksi Fake GPS berbasis Anomali Kecepatan (Velocity check)
    const lastAbsensi = await AbsensiModel.findLastBySiswaId(siswa.id);

    if (lastAbsensi && lastAbsensi.latitude !== 0 && lastAbsensi.longitude !== 0) {
      const distFromLast = calculateDistance(latVal, lngVal, lastAbsensi.latitude, lastAbsensi.longitude);
      const timeDiffMins = (new Date() - new Date(lastAbsensi.created_at)) / (1000 * 60);

      if (timeDiffMins > 0 && timeDiffMins < 60) {
        const speedKmh = (distFromLast / 1000) / (timeDiffMins / 60);
        if (speedKmh > 120) {
          return sendError(
            res,
            `Absensi ditolak. Terdeteksi aktivitas mencurigakan: Perpindahan lokasi Anda terlalu cepat (${speedKmh.toFixed(1)} km/jam). Harap matikan Fake GPS.`,
            400
          );
        }
      }
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
    const existing = await AbsensiModel.findSpecificAbsensi(siswa.id, agenda.id);

    let result;
    if (existing) {
      result = await AbsensiModel.update(existing.id, {
        latitude: latVal,
        longitude: lngVal,
        jarak: parseFloat(distance.toFixed(2)),
        foto_absen: selfieUrl || undefined,
        status: 'HADIR',
        keterangan: 'Absensi GPS Android'
      });
    } else {
      result = await AbsensiModel.create({
        siswa_id: siswa.id,
        agenda_id: agenda.id,
        latitude: latVal,
        longitude: lngVal,
        jarak: parseFloat(distance.toFixed(2)),
        foto_absen: selfieUrl,
        status: 'HADIR',
        keterangan: 'Absensi GPS Android'
      });
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
    const siswa = await SiswaModel.findByUserId(userId);

    if (!siswa) {
      return sendError(res, 'Profil siswa tidak ditemukan.', 404);
    }

    // Ambil data agenda
    const agenda = await AgendaModel.findById(agendaId);

    if (!agenda) {
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
    const existing = await AbsensiModel.findSpecificAbsensi(siswa.id, agenda.id);

    const statusVal = (type || 'IZIN').toUpperCase();

    let result;
    if (existing) {
      result = await AbsensiModel.update(existing.id, {
        latitude: 0,
        longitude: 0,
        jarak: 0,
        foto_absen: docUrl || undefined,
        status: statusVal,
        keterangan: reason || `Izin ketidakhadiran: ${type}`
      });
    } else {
      result = await AbsensiModel.create({
        siswa_id: siswa.id,
        agenda_id: agenda.id,
        latitude: 0,
        longitude: 0,
        jarak: 0,
        foto_absen: docUrl,
        status: statusVal,
        keterangan: reason || `Izin ketidakhadiran: ${type}`
      });
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
    const siswa = await SiswaModel.findByUserId(userId);

    if (!siswa) {
      return sendSuccess(res, 'Data absensi hari ini kosong.', null);
    }

    const today = new Date().toISOString().split('T')[0];
    const logs = await AbsensiModel.findTodayBySiswaId(siswa.id, today);

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
    const siswa = await SiswaModel.findByUserId(userId);

    if (!siswa) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: 'Profil siswa tidak ditemukan.'
      });
    }

    // Ambil agenda aktif
    const agenda = await AgendaModel.findById(agendaId);

    if (!agenda) {
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
    const existing = await AbsensiModel.findSpecificAbsensi(siswa.id, agenda.id);

    if (existing) {
      await AbsensiModel.update(existing.id, {
        latitude: latVal,
        longitude: lngVal,
        jarak: parseFloat(distance.toFixed(2)),
        foto_absen: selfieUrl,
        status: 'HADIR',
        keterangan: 'Verifikasi Wajah Android'
      });
    } else {
      await AbsensiModel.create({
        siswa_id: siswa.id,
        agenda_id: agenda.id,
        latitude: latVal,
        longitude: lngVal,
        jarak: parseFloat(distance.toFixed(2)),
        foto_absen: selfieUrl,
        status: 'HADIR',
        keterangan: 'Verifikasi Wajah Android'
      });
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

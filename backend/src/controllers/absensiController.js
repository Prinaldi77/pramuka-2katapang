const supabase = require('../config/supabase');
const { calculateDistance } = require('../utils/gpsHelper');
const { sendSuccess, sendError } = require('../utils/responseHelper');


// Buat data absensi baru
const createAbsensi = async (req, res, next) => {
  try {
    const { siswa_id, agenda_id, latitude, longitude } = req.body;
    const user = req.user;

    // Authorization check to prevent IDOR check-ins
    if (user.role === 'siswa') {
      const { data: siswa, error: siswaErr } = await supabase
        .from('siswa')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (siswaErr || !siswa || siswa.id !== parseInt(siswa_id)) {
        return sendError(res, 'Akses ditolak. Anda hanya diperbolehkan mengirim data absensi untuk diri Anda sendiri.', 403);
      }
    }

    // Ambil detail agenda
    const { data: agenda, error: agendaError } = await supabase
      .from('agenda_absensi')
      .select('*')
      .eq('id', agenda_id)
      .maybeSingle();

    if (agendaError || !agenda) {
      return sendError(res, 'Agenda absensi tidak ditemukan.', 404);
    }

    if (agenda.status === 'nonaktif') {
      return sendError(res, 'Agenda absensi ini sudah tidak aktif.', 400);
    }

    // Periksa apakah siswa sudah absen untuk agenda ini
    const { data: existingAbsensi, error: checkError } = await supabase
      .from('absensi')
      .select('id')
      .eq('siswa_id', siswa_id)
      .eq('agenda_id', agenda_id)
      .maybeSingle();

    if (checkError) throw checkError;
    if (existingAbsensi) {
      return sendError(res, 'Siswa sudah melakukan absensi untuk agenda ini.', 400);
    }

    // Deteksi Fake GPS berbasis Anomali Kecepatan (Velocity check)
    const { data: lastAbsensi } = await supabase
      .from('absensi')
      .select('latitude, longitude, created_at')
      .eq('siswa_id', siswa_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastAbsensi && lastAbsensi.latitude !== 0 && lastAbsensi.longitude !== 0) {
      const distFromLast = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        lastAbsensi.latitude,
        lastAbsensi.longitude
      );
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

    // Hitung jarak lokasi dengan rumus Haversine
    const distance = calculateDistance(
      parseFloat(latitude),
      parseFloat(longitude),
      agenda.latitude,
      agenda.longitude
    );

    // Validasi radius agenda
    if (distance > agenda.radius) {
      return sendError(
        res,
        `Absensi gagal. Anda berada di luar radius agenda ini. (Jarak Anda: ${distance.toFixed(1)} meter, Radius maks: ${agenda.radius} meter)`,
        400
      );
    }

    // Simpan data absensi
    const { data: absensi, error: saveError } = await supabase
      .from('absensi')
      .insert([{
        siswa_id: parseInt(siswa_id),
        agenda_id: parseInt(agenda_id),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        jarak: parseFloat(distance.toFixed(2))
      }])
      .select('*, siswa(*, users(nama)), agenda_absensi(*)')
      .single();

    if (saveError) throw saveError;

    return sendSuccess(res, 'Absensi berhasil.', absensi, 201);
  } catch (error) {
    next(error);
  }
};


// Ambil semua data absensi
const getAbsensi = async (req, res, next) => {
  try {
    const { data: absensiList, error } = await supabase
      .from('absensi')
      .select('*, siswa(*, users(nama)), agenda_absensi(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 'Data absensi berhasil diambil.', absensiList);
  } catch (error) {
    next(error);
  }
};

// Ambil data absensi berdasarkan ID
const getAbsensiById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: absensi, error } = await supabase
      .from('absensi')
      .select('*, siswa(*, users(nama)), agenda_absensi(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !absensi) {
      return sendError(res, 'Data absensi tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data absensi berhasil diambil.', absensi);
  } catch (error) {
    next(error);
  }
};

const getAbsensiBySiswa = async (req, res, next) => {
  try {
    const { siswaId } = req.params;
    const user = req.user;

    // Authorization check to prevent IDOR
    if (user.role === 'siswa') {
      const { data: siswa, error: siswaErr } = await supabase
        .from('siswa')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (siswaErr || !siswa || siswa.id !== parseInt(siswaId)) {
        return sendError(res, 'Akses ditolak. Anda hanya diperbolehkan melihat data absensi Anda sendiri.', 403);
      }
    }

    const { data: absensiList, error } = await supabase
      .from('absensi')
      .select('*, agenda_absensi(*)')
      .eq('siswa_id', siswaId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 'Data absensi siswa berhasil diambil.', absensiList);
  } catch (error) {
    next(error);
  }
};

// Ambil data absensi berdasarkan ID agenda
const getAbsensiByAgenda = async (req, res, next) => {
  try {
    const { agendaId } = req.params;

    const { data: absensiList, error } = await supabase
      .from('absensi')
      .select('*, siswa(*, users(nama))')
      .eq('agenda_id', agendaId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 'Data absensi agenda berhasil diambil.', absensiList);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAbsensi,
  getAbsensi,
  getAbsensiById,
  getAbsensiBySiswa,
  getAbsensiByAgenda
};

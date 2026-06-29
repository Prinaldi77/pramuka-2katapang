const supabase = require('../config/supabase');
const { calculateDistance } = require('../utils/gpsHelper');
const { sendSuccess, sendError } = require('../utils/responseHelper');


// Buat data absensi baru
const createAbsensi = async (req, res, next) => {
  try {
    const { siswa_id, agenda_id, latitude, longitude } = req.body;

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

// Ambil data absensi berdasarkan ID siswa
const getAbsensiBySiswa = async (req, res, next) => {
  try {
    const { siswaId } = req.params;

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

const SiswaModel = require('../models/siswaModel');
const AgendaModel = require('../models/agendaModel');
const AbsensiModel = require('../models/absensiModel');
const { calculateDistance } = require('../utils/gpsHelper');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Buat data absensi baru
const createAbsensi = async (req, res, next) => {
  try {
    const { siswa_id, agenda_id, latitude, longitude } = req.body;
    const user = req.user;

    // Authorization check to prevent IDOR check-ins
    if (user.role === 'siswa') {
      const siswa = await SiswaModel.findByUserId(user.id);

      if (!siswa || siswa.id !== parseInt(siswa_id)) {
        return sendError(res, 'Akses ditolak. Anda hanya diperbolehkan mengirim data absensi untuk diri Anda sendiri.', 403);
      }
    }

    // Ambil detail agenda
    const agenda = await AgendaModel.findById(agenda_id);

    if (!agenda) {
      return sendError(res, 'Agenda absensi tidak ditemukan.', 404);
    }

    if (agenda.status === 'nonaktif') {
      return sendError(res, 'Agenda absensi ini sudah tidak aktif.', 400);
    }

    // Periksa apakah siswa sudah absen untuk agenda ini
    const existingAbsensi = await AbsensiModel.findSpecificAbsensi(siswa_id, agenda_id);

    if (existingAbsensi) {
      return sendError(res, 'Siswa sudah melakukan absensi untuk agenda ini.', 400);
    }

    // Deteksi Fake GPS berbasis Anomali Kecepatan (Velocity check)
    const lastAbsensi = await AbsensiModel.findLastBySiswaId(siswa_id);

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
    const absensi = await AbsensiModel.create({
      siswa_id: parseInt(siswa_id),
      agenda_id: parseInt(agenda_id),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      jarak: parseFloat(distance.toFixed(2))
    }, '*, siswa(*, users(nama)), agenda_absensi(*)');

    return sendSuccess(res, 'Absensi berhasil.', absensi, 201);
  } catch (error) {
    next(error);
  }
};


// Ambil semua data absensi
const getAbsensi = async (req, res, next) => {
  try {
    const absensiList = await AbsensiModel.findAll();
    return sendSuccess(res, 'Data absensi berhasil diambil.', absensiList);
  } catch (error) {
    next(error);
  }
};

// Ambil data absensi berdasarkan ID
const getAbsensiById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const absensi = await AbsensiModel.findById(id);

    if (!absensi) {
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
      const siswa = await SiswaModel.findByUserId(user.id);

      if (!siswa || siswa.id !== parseInt(siswaId)) {
        return sendError(res, 'Akses ditolak. Anda hanya diperbolehkan melihat data absensi Anda sendiri.', 403);
      }
    }

    const absensiList = await AbsensiModel.findBySiswaId(siswaId);
    return sendSuccess(res, 'Data absensi siswa berhasil diambil.', absensiList);
  } catch (error) {
    next(error);
  }
};

// Ambil data absensi berdasarkan ID agenda
const getAbsensiByAgenda = async (req, res, next) => {
  try {
    const { agendaId } = req.params;
    const absensiList = await AbsensiModel.findByAgendaId(agendaId);

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

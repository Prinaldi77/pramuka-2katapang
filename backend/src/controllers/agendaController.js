const AgendaModel = require('../models/agendaModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Ambil semua agenda absensi
const getAgenda = async (req, res, next) => {
  try {
    const agendaList = await AgendaModel.findAll();
    return sendSuccess(res, 'Data agenda absensi berhasil diambil.', agendaList);
  } catch (error) {
    next(error);
  }
};

// Ambil data agenda berdasarkan ID
const getAgendaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agenda = await AgendaModel.findById(id);

    if (!agenda) {
      return sendError(res, 'Agenda tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data agenda absensi berhasil diambil.', agenda);
  } catch (error) {
    next(error);
  }
};

// Buat agenda absensi GPS baru
const createAgenda = async (req, res, next) => {
  try {
    const {
      judul,
      tanggal,
      jam_mulai,
      jam_selesai,
      latitude,
      longitude,
      radius,
      status
    } = req.body;

    const agenda = await AgendaModel.create({
      judul,
      tanggal,
      jam_mulai,
      jam_selesai,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseFloat(radius),
      status: status || 'aktif'
    });

    return sendSuccess(res, 'Agenda berhasil ditambahkan.', agenda, 201);
  } catch (error) {
    next(error);
  }
};

// Update data agenda absensi berdasarkan ID
const updateAgenda = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      judul,
      tanggal,
      jam_mulai,
      jam_selesai,
      latitude,
      longitude,
      radius,
      status
    } = req.body;

    const updates = {};
    if (judul !== undefined) updates.judul = judul;
    if (tanggal !== undefined) updates.tanggal = tanggal;
    if (jam_mulai !== undefined) updates.jam_mulai = jam_mulai;
    if (jam_selesai !== undefined) updates.jam_selesai = jam_selesai;
    if (latitude !== undefined) updates.latitude = parseFloat(latitude);
    if (longitude !== undefined) updates.longitude = parseFloat(longitude);
    if (radius !== undefined) updates.radius = parseFloat(radius);
    if (status !== undefined) updates.status = status;

    const agenda = await AgendaModel.update(id, updates);

    return sendSuccess(res, 'Agenda berhasil diperbarui.', agenda);
  } catch (error) {
    next(error);
  }
};

// Hapus agenda absensi berdasarkan ID
const deleteAgenda = async (req, res, next) => {
  try {
    const { id } = req.params;
    await AgendaModel.destroy(id);

    return sendSuccess(res, 'Agenda berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAgenda,
  getAgendaById,
  createAgenda,
  updateAgenda,
  deleteAgenda
};

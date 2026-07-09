const PengurusModel = require('../models/pengurusModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Ambil semua daftar dewan pengurus beserta profil siswanya
const getPengurus = async (req, res, next) => {
  try {
    const pengurusList = await PengurusModel.findAll();
    return sendSuccess(res, 'Data pengurus berhasil diambil.', pengurusList);
  } catch (error) {
    next(error);
  }
};

// Ambil data pengurus berdasarkan ID
const getPengurusById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pengurus = await PengurusModel.findById(id);

    if (!pengurus) {
      return sendError(res, 'Pengurus tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data pengurus berhasil diambil.', pengurus);
  } catch (error) {
    next(error);
  }
};

// Tambah anggota dewan pengurus baru
const createPengurus = async (req, res, next) => {
  try {
    const { siswa_id, jabatan, periode } = req.body;
    const pengurus = await PengurusModel.create({ siswa_id, jabatan, periode });

    return sendSuccess(res, 'Pengurus berhasil ditambahkan.', pengurus, 201);
  } catch (error) {
    next(error);
  }
};

// Update data dewan pengurus berdasarkan ID
const updatePengurus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { siswa_id, jabatan, periode } = req.body;

    const updates = {};
    if (siswa_id !== undefined) updates.siswa_id = siswa_id;
    if (jabatan !== undefined) updates.jabatan = jabatan;
    if (periode !== undefined) updates.periode = periode;

    const pengurus = await PengurusModel.update(id, updates);

    return sendSuccess(res, 'Pengurus berhasil diperbarui.', pengurus);
  } catch (error) {
    next(error);
  }
};

// Hapus pengurus berdasarkan ID
const deletePengurus = async (req, res, next) => {
  try {
    const { id } = req.params;
    await PengurusModel.destroy(id);

    return sendSuccess(res, 'Pengurus berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPengurus,
  getPengurusById,
  createPengurus,
  updatePengurus,
  deletePengurus
};

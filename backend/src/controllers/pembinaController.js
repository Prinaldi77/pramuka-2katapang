const PembinaModel = require('../models/pembinaModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Ambil semua daftar pembina beserta akun usernya
const getPembina = async (req, res, next) => {
  try {
    const pembinaList = await PembinaModel.findAll();
    return sendSuccess(res, 'Data pembina berhasil diambil.', pembinaList);
  } catch (error) {
    next(error);
  }
};

// Ambil data pembina berdasarkan ID
const getPembinaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pembina = await PembinaModel.findById(id);

    if (!pembina) {
      return sendError(res, 'Pembina tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data pembina berhasil diambil.', pembina);
  } catch (error) {
    next(error);
  }
};

// Tambah data pembina baru
const createPembina = async (req, res, next) => {
  try {
    const { user_id, jabatan } = req.body;
    const pembina = await PembinaModel.create({ user_id, jabatan });

    return sendSuccess(res, 'Data pembina berhasil ditambahkan.', pembina, 201);
  } catch (error) {
    next(error);
  }
};

// Update data pembina berdasarkan ID
const updatePembina = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jabatan } = req.body;

    const updates = {};
    if (jabatan !== undefined) updates.jabatan = jabatan;

    const pembina = await PembinaModel.update(id, updates);

    return sendSuccess(res, 'Data pembina berhasil diperbarui.', pembina);
  } catch (error) {
    next(error);
  }
};

// Hapus data pembina berdasarkan ID
const deletePembina = async (req, res, next) => {
  try {
    const { id } = req.params;
    await PembinaModel.destroy(id);

    return sendSuccess(res, 'Data pembina berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPembina,
  getPembinaById,
  createPembina,
  updatePembina,
  deletePembina
};

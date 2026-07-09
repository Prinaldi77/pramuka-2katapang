const PesanModel = require('../models/pesanModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Kirim pesan baru via formulir kontak public
const createPesan = async (req, res, next) => {
  try {
    const { nama, email, subjek, pesan } = req.body;

    const savedPesan = await PesanModel.create({
      nama,
      email,
      subjek,
      pesan,
      is_read: false
    });

    return sendSuccess(res, 'Pesan berhasil dikirim.', savedPesan, 201);
  } catch (error) {
    next(error);
  }
};

// Ambil semua pesan masuk (akses Admin)
const getPesan = async (req, res, next) => {
  try {
    const pesanList = await PesanModel.findAll();
    return sendSuccess(res, 'Data pesan berhasil diambil.', pesanList);
  } catch (error) {
    next(error);
  }
};

// Ambil data pesan berdasarkan ID
const getPesanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pesan = await PesanModel.findById(id);

    if (!pesan) {
      return sendError(res, 'Pesan tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data pesan berhasil diambil.', pesan);
  } catch (error) {
    next(error);
  }
};

// Hapus pesan berdasarkan ID
const deletePesan = async (req, res, next) => {
  try {
    const { id } = req.params;
    await PesanModel.destroy(id);

    return sendSuccess(res, 'Pesan berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

// Tandai pesan sudah dibaca
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const pesan = await PesanModel.update(id, { is_read: true });

    if (!pesan) {
      return sendError(res, 'Pesan tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Pesan berhasil ditandai telah dibaca.', pesan);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPesan,
  getPesan,
  getPesanById,
  deletePesan,
  markAsRead
};

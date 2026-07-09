const PrestasiModel = require('../models/prestasiModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

// Ambil semua daftar prestasi
const getPrestasi = async (req, res, next) => {
  try {
    const prestasiList = await PrestasiModel.findAll();
    return sendSuccess(res, 'Data prestasi berhasil diambil.', prestasiList);
  } catch (error) {
    next(error);
  }
};

// Ambil data prestasi berdasarkan ID
const getPrestasiById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const prestasi = await PrestasiModel.findById(id);

    if (!prestasi) {
      return sendError(res, 'Prestasi tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data prestasi berhasil diambil.', prestasi);
  } catch (error) {
    next(error);
  }
};

// Buat data prestasi baru beserta gambar
const createPrestasi = async (req, res, next) => {
  try {
    const { nama_prestasi, deskripsi, tanggal } = req.body;
    let gambarUrl = null;

    if (req.file) {
      gambarUrl = await uploadFile(req.file, 'prestasi');
    }

    const prestasi = await PrestasiModel.create({
      nama_prestasi,
      deskripsi,
      tanggal,
      gambar: gambarUrl
    });

    return sendSuccess(res, 'Prestasi berhasil ditambahkan.', prestasi, 201);
  } catch (error) {
    next(error);
  }
};

// Update data prestasi berdasarkan ID
const updatePrestasi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_prestasi, deskripsi, tanggal } = req.body;

    const existingPrestasi = await PrestasiModel.findById(id);

    if (!existingPrestasi) {
      return sendError(res, 'Prestasi tidak ditemukan.', 404);
    }

    const updates = {};
    if (nama_prestasi !== undefined) updates.nama_prestasi = nama_prestasi;
    if (deskripsi !== undefined) updates.deskripsi = deskripsi;
    if (tanggal !== undefined) updates.tanggal = tanggal;

    if (req.file) {
      const gambarUrl = await uploadFile(req.file, 'prestasi');
      updates.gambar = gambarUrl;

      // Hapus gambar lama
      if (existingPrestasi.gambar) {
        await deleteFile(existingPrestasi.gambar, 'prestasi');
      }
    }

    const prestasi = await PrestasiModel.update(id, updates);

    return sendSuccess(res, 'Prestasi berhasil diperbarui.', prestasi);
  } catch (error) {
    next(error);
  }
};

// Hapus prestasi berdasarkan ID
const deletePrestasi = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prestasi = await PrestasiModel.findById(id);

    if (!prestasi) {
      return sendError(res, 'Prestasi tidak ditemukan.', 404);
    }

    // Hapus gambar dari storage
    if (prestasi.gambar) {
      await deleteFile(prestasi.gambar, 'prestasi');
    }

    await PrestasiModel.destroy(id);

    return sendSuccess(res, 'Prestasi berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrestasi,
  getPrestasiById,
  createPrestasi,
  updatePrestasi,
  deletePrestasi
};

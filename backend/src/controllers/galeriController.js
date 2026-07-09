const GaleriModel = require('../models/galeriModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

// Ambil semua foto galeri
const getGaleri = async (req, res, next) => {
  try {
    const galeriList = await GaleriModel.findAll();
    return sendSuccess(res, 'Data galeri berhasil diambil.', galeriList);
  } catch (error) {
    next(error);
  }
};

// Ambil item galeri berdasarkan ID
const getGaleriById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const galeri = await GaleriModel.findById(id);

    if (!galeri) {
      return sendError(res, 'Galeri tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data galeri berhasil diambil.', galeri);
  } catch (error) {
    next(error);
  }
};

// Tambah foto baru ke galeri
const createGaleri = async (req, res, next) => {
  try {
    const { judul } = req.body;

    if (!req.file) {
      return sendError(res, 'File gambar wajib diunggah.', 400);
    }

    const gambarUrl = await uploadFile(req.file, 'galeri');

    try {
      const galeri = await GaleriModel.create({
        judul,
        gambar: gambarUrl
      });
      return sendSuccess(res, 'Item galeri berhasil ditambahkan.', galeri, 201);
    } catch (error) {
      // Hapus file dari storage jika insert gagal
      if (gambarUrl) await deleteFile(gambarUrl, 'galeri');
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Hapus foto galeri berdasarkan ID
const deleteGaleri = async (req, res, next) => {
  try {
    const { id } = req.params;

    const galeri = await GaleriModel.findById(id);

    if (!galeri) {
      return sendError(res, 'Item galeri tidak ditemukan.', 404);
    }

    // Hapus gambar dari storage
    if (galeri.gambar) {
      await deleteFile(galeri.gambar, 'galeri');
    }

    await GaleriModel.destroy(id);

    return sendSuccess(res, 'Item galeri berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGaleri,
  getGaleriById,
  createGaleri,
  deleteGaleri
};

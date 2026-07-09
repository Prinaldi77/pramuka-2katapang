const BeritaModel = require('../models/beritaModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

// Ambil semua daftar berita
const getBerita = async (req, res, next) => {
  try {
    const beritaList = await BeritaModel.findAll();
    return sendSuccess(res, 'Data berita berhasil diambil.', beritaList);
  } catch (error) {
    next(error);
  }
};

// Ambil data berita berdasarkan ID
const getBeritaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const berita = await BeritaModel.findById(id);

    if (!berita) {
      return sendError(res, 'Berita tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data berita berhasil diambil.', berita);
  } catch (error) {
    next(error);
  }
};

// Buat berita baru beserta gambar
const createBerita = async (req, res, next) => {
  try {
    const { judul, isi, author_id } = req.body;
    let gambarUrl = null;

    if (req.file) {
      gambarUrl = await uploadFile(req.file, 'berita');
    }

    const author = author_id ? parseInt(author_id) : req.user.id;

    const berita = await BeritaModel.create({
      judul,
      isi,
      gambar: gambarUrl,
      author_id: author
    });

    return sendSuccess(res, 'Berita berhasil ditambahkan.', berita, 201);
  } catch (error) {
    next(error);
  }
};

// Update data berita berdasarkan ID
const updateBerita = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { judul, isi, author_id } = req.body;

    // Ambil data berita yang sudah ada
    const existingBerita = await BeritaModel.findById(id);

    if (!existingBerita) {
      return sendError(res, 'Berita tidak ditemukan.', 404);
    }

    const updates = {};
    if (judul !== undefined) updates.judul = judul;
    if (isi !== undefined) updates.isi = isi;
    if (author_id !== undefined) updates.author_id = parseInt(author_id);

    // Unggah gambar baru jika disertakan
    if (req.file) {
      const gambarUrl = await uploadFile(req.file, 'berita');
      updates.gambar = gambarUrl;

      // Hapus gambar lama dari storage
      if (existingBerita.gambar) {
        await deleteFile(existingBerita.gambar, 'berita');
      }
    }

    const berita = await BeritaModel.update(id, updates);

    return sendSuccess(res, 'Berita berhasil diperbarui.', berita);
  } catch (error) {
    next(error);
  }
};

// Hapus berita berdasarkan ID
const deleteBerita = async (req, res, next) => {
  try {
    const { id } = req.params;

    const berita = await BeritaModel.findById(id);

    if (!berita) {
      return sendError(res, 'Berita tidak ditemukan.', 404);
    }

    // Hapus file gambar di storage
    if (berita.gambar) {
      await deleteFile(berita.gambar, 'berita');
    }

    await BeritaModel.destroy(id);

    return sendSuccess(res, 'Berita berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBerita,
  getBeritaById,
  createBerita,
  updateBerita,
  deleteBerita
};

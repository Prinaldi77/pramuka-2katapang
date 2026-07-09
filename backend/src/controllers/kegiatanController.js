const KegiatanModel = require('../models/kegiatanModel');
const SiswaModel = require('../models/siswaModel');
const PembinaModel = require('../models/pembinaModel');
const PengurusModel = require('../models/pengurusModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

// Ambil semua daftar kegiatan
const getKegiatan = async (req, res, next) => {
  try {
    const kegiatanList = await KegiatanModel.findAll();
    return sendSuccess(res, 'Data kegiatan berhasil diambil.', kegiatanList);
  } catch (error) {
    next(error);
  }
};

// Ambil data kegiatan berdasarkan ID
const getKegiatanById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const kegiatan = await KegiatanModel.findById(id);

    if (!kegiatan) {
      return sendError(res, 'Kegiatan tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data kegiatan berhasil diambil.', kegiatan);
  } catch (error) {
    next(error);
  }
};

// Buat kegiatan baru
const createKegiatan = async (req, res, next) => {
  try {
    const { nama_kegiatan, deskripsi, tanggal, lokasi } = req.body;
    let gambarUrl = null;

    if (req.file) {
      gambarUrl = await uploadFile(req.file, 'kegiatan');
    }

    const kegiatan = await KegiatanModel.create({
      nama_kegiatan,
      deskripsi,
      tanggal,
      lokasi,
      gambar: gambarUrl
    });

    return sendSuccess(res, 'Kegiatan berhasil ditambahkan.', kegiatan, 201);
  } catch (error) {
    next(error);
  }
};

// Update data kegiatan berdasarkan ID
const updateKegiatan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_kegiatan, deskripsi, tanggal, lokasi } = req.body;

    const existingKegiatan = await KegiatanModel.findById(id);

    if (!existingKegiatan) {
      return sendError(res, 'Kegiatan tidak ditemukan.', 404);
    }

    const updates = {};
    if (nama_kegiatan !== undefined) updates.nama_kegiatan = nama_kegiatan;
    if (deskripsi !== undefined) updates.deskripsi = deskripsi;
    if (tanggal !== undefined) updates.tanggal = tanggal;
    if (lokasi !== undefined) updates.lokasi = lokasi;

    if (req.file) {
      const gambarUrl = await uploadFile(req.file, 'kegiatan');
      updates.gambar = gambarUrl;

      // Hapus gambar lama
      if (existingKegiatan.gambar) {
        await deleteFile(existingKegiatan.gambar, 'kegiatan');
      }
    }

    const kegiatan = await KegiatanModel.update(id, updates);

    return sendSuccess(res, 'Kegiatan berhasil diperbarui.', kegiatan);
  } catch (error) {
    next(error);
  }
};

// Hapus kegiatan berdasarkan ID
const deleteKegiatan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const kegiatan = await KegiatanModel.findById(id);

    if (!kegiatan) {
      return sendError(res, 'Kegiatan tidak ditemukan.', 404);
    }

    // Hapus file gambar di storage
    if (kegiatan.gambar) {
      await deleteFile(kegiatan.gambar, 'kegiatan');
    }

    await KegiatanModel.destroy(id);

    return sendSuccess(res, 'Kegiatan berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

// Ambil statistik publik (untuk landing page luar)
const getPublicStats = async (req, res, next) => {
  try {
    const [siswaCount, pembinaCount, pengurusCount, kegiatanCount] = await Promise.all([
      SiswaModel.count(),
      PembinaModel.count(),
      PengurusModel.count(),
      KegiatanModel.count(),
    ]);

    const stats = {
      siswa: siswaCount,
      pembina: pembinaCount,
      pengurus: pengurusCount,
      kegiatan: kegiatanCount
    };

    return sendSuccess(res, 'Statistik publik berhasil diambil.', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKegiatan,
  getKegiatanById,
  createKegiatan,
  updateKegiatan,
  deleteKegiatan,
  getPublicStats
};

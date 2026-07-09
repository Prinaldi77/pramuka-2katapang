const PengaturanModel = require('../models/pengaturanModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

// Ambil pengaturan website
const getPengaturan = async (req, res, next) => {
  try {
    const config = await PengaturanModel.findFirst() || {};
    return sendSuccess(res, 'Pengaturan website berhasil diambil.', config);
  } catch (error) {
    next(error);
  }
};

// Update pengaturan website (mendukung unggah logo & favicon)
const updatePengaturan = async (req, res, next) => {
  try {
    const { nama_aplikasi, footer } = req.body;

    // Ambil data konfigurasi yang sudah ada
    const existingConfig = await PengaturanModel.findFirst();

    const updates = {};
    if (nama_aplikasi !== undefined) updates.nama_aplikasi = nama_aplikasi;
    if (footer !== undefined) updates.footer = footer;

    // Periksa apakah file diunggah
    if (req.files) {
      // Unggah file logo website
      if (req.files.logo && req.files.logo[0]) {
        const logoUrl = await uploadFile(req.files.logo[0], 'pengaturan');
        updates.logo = logoUrl;

        // Hapus logo lama
        if (existingConfig && existingConfig.logo) {
          await deleteFile(existingConfig.logo, 'pengaturan');
        }
      }

      // Unggah file favicon website
      if (req.files.favicon && req.files.favicon[0]) {
        const faviconUrl = await uploadFile(req.files.favicon[0], 'pengaturan');
        updates.favicon = faviconUrl;

        // Hapus favicon lama
        if (existingConfig && existingConfig.favicon) {
          await deleteFile(existingConfig.favicon, 'pengaturan');
        }
      }
    }

    let resultData;

    if (existingConfig) {
      // Update konfigurasi
      resultData = await PengaturanModel.update(existingConfig.id, updates);
    } else {
      // Simpan konfigurasi awal jika belum ada
      if (!updates.nama_aplikasi) {
        updates.nama_aplikasi = 'Sistem Informasi Pramuka SMPN 2 Katapang';
      }

      resultData = await PengaturanModel.create(updates);
    }

    return sendSuccess(res, 'Pengaturan website berhasil diperbarui.', resultData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPengaturan,
  updatePengaturan
};

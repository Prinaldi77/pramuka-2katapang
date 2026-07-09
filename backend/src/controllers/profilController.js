const ProfilModel = require('../models/profilModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

// Ambil profil organisasi Gudep
const getProfil = async (req, res, next) => {
  try {
    const profil = await ProfilModel.findFirst() || {};
    return sendSuccess(res, 'Data profil berhasil diambil.', profil);
  } catch (error) {
    next(error);
  }
};

// Update data profil organisasi Gudep
const updateProfil = async (req, res, next) => {
  try {
    const { nama_gudep, deskripsi, visi, misi, alamat, email, telepon } = req.body;

    // Ambil profil yang sudah ada untuk memeriksa operasi insert/update
    const existingProfil = await ProfilModel.findFirst();

    const updates = {};
    if (nama_gudep !== undefined) updates.nama_gudep = nama_gudep;
    if (deskripsi !== undefined) updates.deskripsi = deskripsi;
    if (visi !== undefined) updates.visi = visi;
    if (misi !== undefined) updates.misi = misi;
    if (alamat !== undefined) updates.alamat = alamat;
    if (email !== undefined) updates.email = email;
    if (telepon !== undefined) updates.telepon = telepon;

    // Unggah file logo
    if (req.file) {
      const logoUrl = await uploadFile(req.file, 'profil');
      updates.logo = logoUrl;

      // Hapus logo lama jika ada
      if (existingProfil && existingProfil.logo) {
        await deleteFile(existingProfil.logo, 'profil');
      }
    } else if (req.body.logo !== undefined) {
      updates.logo = req.body.logo;
    }

    let resultData;

    if (existingProfil) {
      // Update profil yang sudah ada
      resultData = await ProfilModel.update(existingProfil.id, updates);
    } else {
      // Buat data profil baru
      if (!updates.nama_gudep) {
        updates.nama_gudep = 'Gudep SMPN 2 Katapang';
      }

      resultData = await ProfilModel.create(updates);
    }

    return sendSuccess(res, 'Profil Gudep berhasil diperbarui.', resultData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfil,
  updateProfil
};

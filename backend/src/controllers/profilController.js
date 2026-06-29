const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

// Ambil profil organisasi Gudep
const getProfil = async (req, res, next) => {
  try {
    const { data: profilList, error } = await supabase
      .from('profil')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    // Ambil data pertama (pola singleton)
    const profil = profilList && profilList.length > 0 ? profilList[0] : {};
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
    const { data: profilList, error: fetchError } = await supabase
      .from('profil')
      .select('*')
      .order('id', { ascending: true });

    if (fetchError) throw fetchError;

    const existingProfil = profilList && profilList.length > 0 ? profilList[0] : null;

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
      const { data, error } = await supabase
        .from('profil')
        .update(updates)
        .eq('id', existingProfil.id)
        .select('*')
        .single();
      
      if (error) throw error;
      resultData = data;
    } else {
      // Buat data profil baru
      if (!updates.nama_gudep) {
        updates.nama_gudep = 'Gudep SMPN 2 Katapang';
      }

      const { data, error } = await supabase
        .from('profil')
        .insert([updates])
        .select('*')
        .single();

      if (error) throw error;
      resultData = data;
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

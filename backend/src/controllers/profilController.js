const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

/**
 * Get Gudep organization profile details.
 */
const getProfil = async (req, res, next) => {
  try {
    const { data: profilList, error } = await supabase
      .from('profil')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    // Return the first record (singleton pattern) or an empty object if none exists
    const profil = profilList && profilList.length > 0 ? profilList[0] : {};
    return sendSuccess(res, 'Data profil berhasil diambil.', profil);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Gudep organization profile details.
 */
const updateProfil = async (req, res, next) => {
  try {
    const { nama_gudep, deskripsi, visi, misi, alamat, email, telepon } = req.body;

    // Fetch existing profile to check if we need to insert or update
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

    // Handle logo image upload
    if (req.file) {
      const logoUrl = await uploadFile(req.file, 'profil');
      updates.logo = logoUrl;

      // Delete the old logo if it exists
      if (existingProfil && existingProfil.logo) {
        await deleteFile(existingProfil.logo, 'profil');
      }
    } else if (req.body.logo !== undefined) {
      updates.logo = req.body.logo;
    }

    let resultData;

    if (existingProfil) {
      // Update existing record
      const { data, error } = await supabase
        .from('profil')
        .update(updates)
        .eq('id', existingProfil.id)
        .select('*')
        .single();
      
      if (error) throw error;
      resultData = data;
    } else {
      // Create first profile record
      if (!updates.nama_gudep) {
        // Fallback name if creating for the first time
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

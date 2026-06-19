const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

/**
 * Get website settings (singleton pattern).
 */
const getPengaturan = async (req, res, next) => {
  try {
    const { data: configList, error } = await supabase
      .from('pengaturan')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    const config = configList && configList.length > 0 ? configList[0] : {};
    return sendSuccess(res, 'Pengaturan website berhasil diambil.', config);
  } catch (error) {
    next(error);
  }
};

/**
 * Update website settings, supporting logo and favicon uploads.
 */
const updatePengaturan = async (req, res, next) => {
  try {
    const { nama_aplikasi, footer } = req.body;

    // Retrieve existing configuration
    const { data: configList, error: fetchError } = await supabase
      .from('pengaturan')
      .select('*')
      .order('id', { ascending: true });

    if (fetchError) throw fetchError;

    const existingConfig = configList && configList.length > 0 ? configList[0] : null;

    const updates = {};
    if (nama_aplikasi !== undefined) updates.nama_aplikasi = nama_aplikasi;
    if (footer !== undefined) updates.footer = footer;

    // Check if files were uploaded via multer.fields
    if (req.files) {
      // Handle website logo file upload
      if (req.files.logo && req.files.logo[0]) {
        const logoUrl = await uploadFile(req.files.logo[0], 'pengaturan');
        updates.logo = logoUrl;

        // Delete old logo
        if (existingConfig && existingConfig.logo) {
          await deleteFile(existingConfig.logo, 'pengaturan');
        }
      }

      // Handle website favicon file upload
      if (req.files.favicon && req.files.favicon[0]) {
        const faviconUrl = await uploadFile(req.files.favicon[0], 'pengaturan');
        updates.favicon = faviconUrl;

        // Delete old favicon
        if (existingConfig && existingConfig.favicon) {
          await deleteFile(existingConfig.favicon, 'pengaturan');
        }
      }
    }

    let resultData;

    if (existingConfig) {
      // Update existing configurations
      const { data, error } = await supabase
        .from('pengaturan')
        .update(updates)
        .eq('id', existingConfig.id)
        .select('*')
        .single();

      if (error) throw error;
      resultData = data;
    } else {
      // Insert first configuration record
      if (!updates.nama_aplikasi) {
        updates.nama_aplikasi = 'Sistem Informasi Pramuka SMPN 2 Katapang';
      }

      const { data, error } = await supabase
        .from('pengaturan')
        .insert([updates])
        .select('*')
        .single();

      if (error) throw error;
      resultData = data;
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

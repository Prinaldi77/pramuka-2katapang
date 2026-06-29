const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

// Ambil semua foto galeri
const getGaleri = async (req, res, next) => {
  try {
    const { data: galeriList, error } = await supabase
      .from('galeri')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 'Data galeri berhasil diambil.', galeriList);
  } catch (error) {
    next(error);
  }
};

// Ambil item galeri berdasarkan ID
const getGaleriById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: galeri, error } = await supabase
      .from('galeri')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !galeri) {
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

    const { data: galeri, error } = await supabase
      .from('galeri')
      .insert([{
        judul,
        gambar: gambarUrl
      }])
      .select('*')
      .single();

    if (error) {
      // Hapus file dari storage jika insert gagal
      if (gambarUrl) await deleteFile(gambarUrl, 'galeri');
      throw error;
    }

    return sendSuccess(res, 'Item galeri berhasil ditambahkan.', galeri, 201);
  } catch (error) {
    next(error);
  }
};

// Hapus foto galeri berdasarkan ID
const deleteGaleri = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: galeri, error: fetchError } = await supabase
      .from('galeri')
      .select('gambar')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !galeri) {
      return sendError(res, 'Item galeri tidak ditemukan.', 404);
    }

    // Hapus gambar dari storage
    if (galeri.gambar) {
      await deleteFile(galeri.gambar, 'galeri');
    }

    const { error } = await supabase
      .from('galeri')
      .delete()
      .eq('id', id);

    if (error) throw error;

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

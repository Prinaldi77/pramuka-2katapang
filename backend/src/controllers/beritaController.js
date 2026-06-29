const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

// Ambil semua daftar berita
const getBerita = async (req, res, next) => {
  try {
    const { data: beritaList, error } = await supabase
      .from('berita')
      .select('*, users(nama, email)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 'Data berita berhasil diambil.', beritaList);
  } catch (error) {
    next(error);
  }
};

// Ambil data berita berdasarkan ID
const getBeritaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: berita, error } = await supabase
      .from('berita')
      .select('*, users(nama, email)')
      .eq('id', id)
      .maybeSingle();

    if (error || !berita) {
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

    const { data: berita, error } = await supabase
      .from('berita')
      .insert([{
        judul,
        isi,
        gambar: gambarUrl,
        author_id: author
      }])
      .select('*, users(nama, email)')
      .single();

    if (error) throw error;

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
    const { data: existingBerita, error: fetchError } = await supabase
      .from('berita')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingBerita) {
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

    const { data: berita, error } = await supabase
      .from('berita')
      .update(updates)
      .eq('id', id)
      .select('*, users(nama, email)')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Berita berhasil diperbarui.', berita);
  } catch (error) {
    next(error);
  }
};

// Hapus berita berdasarkan ID
const deleteBerita = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: berita, error: fetchError } = await supabase
      .from('berita')
      .select('gambar')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !berita) {
      return sendError(res, 'Berita tidak ditemukan.', 404);
    }

    // Hapus file gambar di storage
    if (berita.gambar) {
      await deleteFile(berita.gambar, 'berita');
    }

    const { error } = await supabase
      .from('berita')
      .delete()
      .eq('id', id);

    if (error) throw error;

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

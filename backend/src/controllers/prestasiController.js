const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { uploadFile, deleteFile } = require('../services/storageService');

// Ambil semua daftar prestasi
const getPrestasi = async (req, res, next) => {
  try {
    const { data: prestasiList, error } = await supabase
      .from('prestasi')
      .select('*')
      .order('tanggal', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 'Data prestasi berhasil diambil.', prestasiList);
  } catch (error) {
    next(error);
  }
};

// Ambil data prestasi berdasarkan ID
const getPrestasiById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: prestasi, error } = await supabase
      .from('prestasi')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !prestasi) {
      return sendError(res, 'Prestasi tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data prestasi berhasil diambil.', prestasi);
  } catch (error) {
    next(error);
  }
};

// Buat data prestasi baru beserta gambar
const createPrestasi = async (req, res, next) => {
  try {
    const { nama_prestasi, deskripsi, tanggal } = req.body;
    let gambarUrl = null;

    if (req.file) {
      gambarUrl = await uploadFile(req.file, 'prestasi');
    }

    const { data: prestasi, error } = await supabase
      .from('prestasi')
      .insert([{
        nama_prestasi,
        deskripsi,
        tanggal,
        gambar: gambarUrl
      }])
      .select('*')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Prestasi berhasil ditambahkan.', prestasi, 201);
  } catch (error) {
    next(error);
  }
};

// Update data prestasi berdasarkan ID
const updatePrestasi = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nama_prestasi, deskripsi, tanggal } = req.body;

    const { data: existingPrestasi, error: fetchError } = await supabase
      .from('prestasi')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existingPrestasi) {
      return sendError(res, 'Prestasi tidak ditemukan.', 404);
    }

    const updates = {};
    if (nama_prestasi !== undefined) updates.nama_prestasi = nama_prestasi;
    if (deskripsi !== undefined) updates.deskripsi = deskripsi;
    if (tanggal !== undefined) updates.tanggal = tanggal;

    if (req.file) {
      const gambarUrl = await uploadFile(req.file, 'prestasi');
      updates.gambar = gambarUrl;

      // Hapus gambar lama
      if (existingPrestasi.gambar) {
        await deleteFile(existingPrestasi.gambar, 'prestasi');
      }
    }

    const { data: prestasi, error } = await supabase
      .from('prestasi')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Prestasi berhasil diperbarui.', prestasi);
  } catch (error) {
    next(error);
  }
};

// Hapus prestasi berdasarkan ID
const deletePrestasi = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: prestasi, error: fetchError } = await supabase
      .from('prestasi')
      .select('gambar')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !prestasi) {
      return sendError(res, 'Prestasi tidak ditemukan.', 404);
    }

    // Hapus gambar dari storage
    if (prestasi.gambar) {
      await deleteFile(prestasi.gambar, 'prestasi');
    }

    const { error } = await supabase
      .from('prestasi')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Prestasi berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPrestasi,
  getPrestasiById,
  createPrestasi,
  updatePrestasi,
  deletePrestasi
};

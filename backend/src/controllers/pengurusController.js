const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Ambil semua daftar dewan pengurus beserta profil siswanya
const getPengurus = async (req, res, next) => {
  try {
    const { data: pengurusList, error } = await supabase
      .from('pengurus')
      .select('*, siswa(*, users(nama, email))')
      .order('id', { ascending: true });

    if (error) throw error;

    return sendSuccess(res, 'Data pengurus berhasil diambil.', pengurusList);
  } catch (error) {
    next(error);
  }
};

// Ambil data pengurus berdasarkan ID
const getPengurusById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: pengurus, error } = await supabase
      .from('pengurus')
      .select('*, siswa(*, users(nama, email))')
      .eq('id', id)
      .maybeSingle();

    if (error || !pengurus) {
      return sendError(res, 'Pengurus tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data pengurus berhasil diambil.', pengurus);
  } catch (error) {
    next(error);
  }
};

// Tambah anggota dewan pengurus baru
const createPengurus = async (req, res, next) => {
  try {
    const { siswa_id, jabatan, periode } = req.body;

    const { data: pengurus, error } = await supabase
      .from('pengurus')
      .insert([{
        siswa_id,
        jabatan,
        periode
      }])
      .select('*, siswa(*, users(nama, email))')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Pengurus berhasil ditambahkan.', pengurus, 201);
  } catch (error) {
    next(error);
  }
};

// Update data dewan pengurus berdasarkan ID
const updatePengurus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { siswa_id, jabatan, periode } = req.body;

    const updates = {};
    if (siswa_id !== undefined) updates.siswa_id = siswa_id;
    if (jabatan !== undefined) updates.jabatan = jabatan;
    if (periode !== undefined) updates.periode = periode;

    const { data: pengurus, error } = await supabase
      .from('pengurus')
      .update(updates)
      .eq('id', id)
      .select('*, siswa(*, users(nama, email))')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Pengurus berhasil diperbarui.', pengurus);
  } catch (error) {
    next(error);
  }
};

// Hapus pengurus berdasarkan ID
const deletePengurus = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pengurus')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Pengurus berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPengurus,
  getPengurusById,
  createPengurus,
  updatePengurus,
  deletePengurus
};

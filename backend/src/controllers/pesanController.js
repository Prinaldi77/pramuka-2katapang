const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Kirim pesan baru via formulir kontak public
const createPesan = async (req, res, next) => {
  try {
    const { nama, email, subjek, pesan } = req.body;

    const { data: savedPesan, error } = await supabase
      .from('pesan')
      .insert([{
        nama,
        email,
        subjek,
        pesan,
        is_read: false
      }])
      .select('*')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Pesan berhasil dikirim.', savedPesan, 201);
  } catch (error) {
    next(error);
  }
};

// Ambil semua pesan masuk (akses Admin)
const getPesan = async (req, res, next) => {
  try {
    const { data: pesanList, error } = await supabase
      .from('pesan')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return sendSuccess(res, 'Data pesan berhasil diambil.', pesanList);
  } catch (error) {
    next(error);
  }
};

// Ambil data pesan berdasarkan ID
const getPesanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: pesan, error } = await supabase
      .from('pesan')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !pesan) {
      return sendError(res, 'Pesan tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data pesan berhasil diambil.', pesan);
  } catch (error) {
    next(error);
  }
};

// Hapus pesan berdasarkan ID
const deletePesan = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pesan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Pesan berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

// Tandai pesan sudah dibaca
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: pesan, error } = await supabase
      .from('pesan')
      .update({ is_read: true })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !pesan) {
      return sendError(res, 'Pesan tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Pesan berhasil ditandai telah dibaca.', pesan);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPesan,
  getPesan,
  getPesanById,
  deletePesan,
  markAsRead
};

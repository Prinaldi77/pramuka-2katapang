const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Get all pembinas list with user accounts details.
 */
const getPembina = async (req, res, next) => {
  try {
    const { data: pembinaList, error } = await supabase
      .from('pembina')
      .select('*, users(nama, email, role)')
      .order('id', { ascending: true });

    if (error) throw error;

    return sendSuccess(res, 'Data pembina berhasil diambil.', pembinaList);
  } catch (error) {
    next(error);
  }
};

/**
 * Get pembina by ID.
 */
const getPembinaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: pembina, error } = await supabase
      .from('pembina')
      .select('*, users(nama, email, role)')
      .eq('id', id)
      .maybeSingle();

    if (error || !pembina) {
      return sendError(res, 'Pembina tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data pembina berhasil diambil.', pembina);
  } catch (error) {
    next(error);
  }
};

/**
 * Create pembina profile.
 */
const createPembina = async (req, res, next) => {
  try {
    const { user_id, jabatan } = req.body;

    const { data: pembina, error } = await supabase
      .from('pembina')
      .insert([{ user_id, jabatan }])
      .select('*, users(nama, email, role)')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Data pembina berhasil ditambahkan.', pembina, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update pembina profile details by ID.
 */
const updatePembina = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jabatan } = req.body;

    const updates = {};
    if (jabatan !== undefined) updates.jabatan = jabatan;

    const { data: pembina, error } = await supabase
      .from('pembina')
      .update(updates)
      .eq('id', id)
      .select('*, users(nama, email, role)')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Data pembina berhasil diperbarui.', pembina);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete pembina profile by ID.
 */
const deletePembina = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('pembina')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Data pembina berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPembina,
  getPembinaById,
  createPembina,
  updatePembina,
  deletePembina
};

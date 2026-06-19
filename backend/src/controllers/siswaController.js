const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Get all students list with user accounts details.
 */
const getSiswa = async (req, res, next) => {
  try {
    const { data: siswaList, error } = await supabase
      .from('siswa')
      .select('*, users(nama, email, role)')
      .order('id', { ascending: true });

    if (error) throw error;

    return sendSuccess(res, 'Data siswa berhasil diambil.', siswaList);
  } catch (error) {
    next(error);
  }
};

/**
 * Get student by ID.
 */
const getSiswaById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: siswa, error } = await supabase
      .from('siswa')
      .select('*, users(nama, email, role)')
      .eq('id', id)
      .maybeSingle();

    if (error || !siswa) {
      return sendError(res, 'Siswa tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data siswa berhasil diambil.', siswa);
  } catch (error) {
    next(error);
  }
};

/**
 * Create student profile details.
 */
const createSiswa = async (req, res, next) => {
  try {
    const {
      user_id,
      nis,
      kelas,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      nama_ortu,
      no_hp_ortu
    } = req.body;

    const { data: siswa, error } = await supabase
      .from('siswa')
      .insert([{
        user_id,
        nis,
        kelas,
        jenis_kelamin,
        tempat_lahir,
        tanggal_lahir,
        nama_ortu,
        no_hp_ortu
      }])
      .select('*, users(nama, email, role)')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Data siswa berhasil ditambahkan.', siswa, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update student profile details by ID.
 */
const updateSiswa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nis,
      kelas,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      nama_ortu,
      no_hp_ortu
    } = req.body;

    const updates = {};
    if (nis !== undefined) updates.nis = nis;
    if (kelas !== undefined) updates.kelas = kelas;
    if (jenis_kelamin !== undefined) updates.jenis_kelamin = jenis_kelamin;
    if (tempat_lahir !== undefined) updates.tempat_lahir = tempat_lahir;
    if (tanggal_lahir !== undefined) updates.tanggal_lahir = tanggal_lahir;
    if (nama_ortu !== undefined) updates.nama_ortu = nama_ortu;
    if (no_hp_ortu !== undefined) updates.no_hp_ortu = no_hp_ortu;

    const { data: siswa, error } = await supabase
      .from('siswa')
      .update(updates)
      .eq('id', id)
      .select('*, users(nama, email, role)')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'Data siswa berhasil diperbarui.', siswa);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete student profile by ID.
 */
const deleteSiswa = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('siswa')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'Data siswa berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSiswa,
  getSiswaById,
  createSiswa,
  updateSiswa,
  deleteSiswa
};

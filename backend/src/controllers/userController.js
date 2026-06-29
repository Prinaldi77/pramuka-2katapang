const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Ambil semua daftar user
const getUsers = async (req, res, next) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, nama, email, role, created_at')
      .order('id', { ascending: true });

    if (error) throw error;

    return sendSuccess(res, 'Data user berhasil diambil.', users);
  } catch (error) {
    next(error);
  }
};

// Ambil data user berdasarkan ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, nama, email, role, created_at')
      .eq('id', id)
      .maybeSingle();

    if (error || !user) {
      return sendError(res, 'User tidak ditemukan.', 404);
    }

    return sendSuccess(res, 'Data user berhasil diambil.', user);
  } catch (error) {
    next(error);
  }
};

// Buat akun user baru
const createUser = async (req, res, next) => {
  try {
    const { name, nama, email, password, role } = req.body;
    const nameValue = name || nama;

    // Hash sandi password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan user ke database
    const { data: user, error } = await supabase
      .from('users')
      .insert([{ nama: nameValue, email, password: hashedPassword, role }])
      .select('id, nama, email, role, created_at')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'User berhasil dibuat.', user, 201);
  } catch (error) {
    next(error);
  }
};

// Update data akun user berdasarkan ID
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, nama, email, password, role } = req.body;

    const updates = {};
    if (name !== undefined || nama !== undefined) updates.nama = name || nama;
    if (email !== undefined) updates.email = email;
    if (role !== undefined) updates.role = role;
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(password, salt);
    }

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, nama, email, role, created_at')
      .single();

    if (error) throw error;

    return sendSuccess(res, 'User berhasil diperbarui.', user);
  } catch (error) {
    next(error);
  }
};

// Hapus akun user berdasarkan ID
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return sendSuccess(res, 'User berhasil dihapus.', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

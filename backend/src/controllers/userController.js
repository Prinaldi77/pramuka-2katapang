const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');

// Ambil semua daftar user
const getUsers = async (req, res, next) => {
  try {
    const users = await UserModel.findAll();
    return sendSuccess(res, 'Data user berhasil diambil.', users);
  } catch (error) {
    next(error);
  }
};

// Ambil data user berdasarkan ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
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
    const user = await UserModel.create({
      nama: nameValue,
      email,
      password: hashedPassword,
      role
    });

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

    const user = await UserModel.update(id, updates);

    return sendSuccess(res, 'User berhasil diperbarui.', user);
  } catch (error) {
    next(error);
  }
};

// Hapus akun user berdasarkan ID
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await UserModel.destroy(id);

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

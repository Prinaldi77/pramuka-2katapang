const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const SiswaModel = require('../models/siswaModel');
const PembinaModel = require('../models/pembinaModel');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const tokenBlacklist = require('../utils/tokenBlacklist');

// Proses login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Ambil data user dari database
    const user = await UserModel.findByEmail(email);

    if (!user) {
      return sendError(res, 'Email atau password salah.', 401);
    }

    // Verifikasi password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Email atau password salah.', 401);
    }

    if (!process.env.JWT_SECRET) {
      console.error('FATAL SECURITY ERROR: JWT_SECRET is not defined in environment variables!');
      return sendError(res, 'Konfigurasi keamanan server tidak valid.', 500);
    }

    // Buat token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Hapus password dari objek response
    delete user.password;

    return sendSuccess(res, 'Login berhasil.', {
      token,
      role: user.role,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Proses logout user
const logout = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    tokenBlacklist.addToken(token);
  }
  return sendSuccess(res, 'Logout berhasil.', {});
};

// Ambil data profil user yang sedang login
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    let fullProfile = { ...user };

    // Ambil detail profil berdasarkan role
    if (user.role === 'siswa') {
      const siswaData = await SiswaModel.findByUserId(user.id);
      fullProfile.siswa = siswaData || null;
    } else if (user.role === 'pembina') {
      const pembinaData = await PembinaModel.findByUserId(user.id);
      fullProfile.pembina = pembinaData || null;
    }

    return sendSuccess(res, 'Profil berhasil diambil.', fullProfile);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  logout,
  getProfile
};

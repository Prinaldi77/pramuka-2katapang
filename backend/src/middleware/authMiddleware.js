const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responseHelper');
const supabase = require('../config/supabase');

// Verifikasi token JWT
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Akses ditolak. Token tidak disediakan.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Cari user di database
    const { data: user, error } = await supabase
      .from('users')
      .select('id, nama, email, role')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return sendError(res, 'User tidak ditemukan atau token tidak valid.', 401);
    }

    // Pasang data user ke request
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Token tidak valid atau kadaluwarsa.', 401);
  }
};

// Validasi role Admin
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 'Akses ditolak. Hanya untuk Admin.', 403);
  }
};

// Validasi role Pembina (atau Admin)
const verifyPembina = (req, res, next) => {
  if (req.user && (req.user.role === 'pembina' || req.user.role === 'admin')) {
    next();
  } else {
    return sendError(res, 'Akses ditolak. Hanya untuk Pembina.', 403);
  }
};

// Validasi role Siswa (atau Admin)
const verifySiswa = (req, res, next) => {
  if (req.user && (req.user.role === 'siswa' || req.user.role === 'admin')) {
    next();
  } else {
    return sendError(res, 'Akses ditolak. Hanya untuk Siswa.', 403);
  }
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyPembina,
  verifySiswa
};

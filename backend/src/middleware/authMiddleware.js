const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responseHelper');
const supabase = require('../config/supabase');

/**
 * Middleware to verify JWT token.
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Akses ditolak. Token tidak disediakan.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Retrieve user from Supabase to verify existence
    const { data: user, error } = await supabase
      .from('users')
      .select('id, nama, email, role')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return sendError(res, 'User tidak ditemukan atau token tidak valid.', 401);
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    return sendError(res, 'Token tidak valid atau kadaluwarsa.', 401);
  }
};

/**
 * Middleware to authorize Admin role.
 */
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return sendError(res, 'Akses ditolak. Hanya untuk Admin.', 403);
  }
};

/**
 * Middleware to authorize Pembina (or Admin) role.
 */
const verifyPembina = (req, res, next) => {
  if (req.user && (req.user.role === 'pembina' || req.user.role === 'admin')) {
    next();
  } else {
    return sendError(res, 'Akses ditolak. Hanya untuk Pembina.', 403);
  }
};

/**
 * Middleware to authorize Siswa (or Admin) role.
 */
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

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * Handle user login.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user from DB
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return sendError(res, 'Email atau password salah.', 401);
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(res, 'Email atau password salah.', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Strip password out of response
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

/**
 * Handle user logout (Stateless JWT logout is just client-side, 
 * but we provide an endpoint to clear headers or confirm logout).
 */
const logout = async (req, res) => {
  return sendSuccess(res, 'Logout berhasil.', {});
};

/**
 * Retrieve current logged-in user profile.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = req.user;
    let fullProfile = { ...user };

    // Fetch related profile based on user role
    if (user.role === 'siswa') {
      const { data: siswaData } = await supabase
        .from('siswa')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      fullProfile.siswa = siswaData || null;
    } else if (user.role === 'pembina') {
      const { data: pembinaData } = await supabase
        .from('pembina')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

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

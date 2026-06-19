const { body } = require('express-validator');
const supabase = require('../config/supabase');

const createPembinaValidation = [
  body('user_id')
    .notEmpty().withMessage('User ID wajib diisi')
    .isInt().withMessage('User ID harus berupa angka')
    .custom(async (value) => {
      // Check if user exists and has role 'pembina'
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', value)
        .single();
      
      if (error || !user) {
        throw new Error('User ID tidak ditemukan');
      }
      if (user.role !== 'pembina') {
        throw new Error('User ID ini tidak ber-role pembina');
      }

      // Check if pembina profile already exists
      const { data: existingPembina } = await supabase
        .from('pembina')
        .select('id')
        .eq('user_id', value);

      if (existingPembina && existingPembina.length > 0) {
        throw new Error('Profil pembina untuk User ID ini sudah terdaftar');
      }
      return true;
    }),
  body('jabatan')
    .trim()
    .notEmpty().withMessage('Jabatan wajib diisi')
];

const updatePembinaValidation = [
  body('jabatan')
    .optional()
    .trim()
    .notEmpty().withMessage('Jabatan tidak boleh kosong')
];

module.exports = {
  createPembinaValidation,
  updatePembinaValidation
};

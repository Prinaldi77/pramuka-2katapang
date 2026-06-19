const { body } = require('express-validator');
const supabase = require('../config/supabase');

const createUserValidation = [
  body('name')
    .custom((value, { req }) => {
      const nameVal = value ? value.trim() : '';
      const namaVal = req.body.nama ? req.body.nama.trim() : '';
      if (!nameVal && !namaVal) {
        throw new Error('Nama wajib diisi');
      }
      return true;
    }),
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .custom(async (value) => {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', value);
      
      if (data && data.length > 0) {
        throw new Error('Email sudah terdaftar');
      }
      return true;
    }),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('role')
    .notEmpty().withMessage('Role wajib diisi')
    .isIn(['admin', 'pembina', 'siswa']).withMessage('Role tidak valid (harus admin, pembina, atau siswa)')
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim(),
  body('nama')
    .optional()
    .trim(),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Format email tidak valid')
    .custom(async (value, { req }) => {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', value)
        .neq('id', req.params.id);
      
      if (data && data.length > 0) {
        throw new Error('Email sudah terdaftar pada user lain');
      }
      return true;
    }),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('role')
    .optional()
    .isIn(['admin', 'pembina', 'siswa']).withMessage('Role tidak valid (harus admin, pembina, atau siswa)')
];

module.exports = {
  createUserValidation,
  updateUserValidation
};

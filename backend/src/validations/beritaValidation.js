const { body } = require('express-validator');
const supabase = require('../config/supabase');

const createBeritaValidation = [
  body('judul')
    .trim()
    .notEmpty().withMessage('Judul berita wajib diisi'),
  body('isi')
    .trim()
    .notEmpty().withMessage('Isi berita wajib diisi'),
  body('author_id')
    .optional()
    .isInt().withMessage('Author ID harus berupa angka')
    .custom(async (value) => {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', value)
        .single();
      
      if (error || !data) {
        throw new Error('Author ID tidak ditemukan');
      }
      return true;
    })
];

const updateBeritaValidation = [
  body('judul')
    .optional()
    .trim()
    .notEmpty().withMessage('Judul berita tidak boleh kosong'),
  body('isi')
    .optional()
    .trim()
    .notEmpty().withMessage('Isi berita tidak boleh kosong'),
  body('author_id')
    .optional()
    .isInt().withMessage('Author ID harus berupa angka')
    .custom(async (value) => {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', value)
        .single();
      
      if (error || !data) {
        throw new Error('Author ID tidak ditemukan');
      }
      return true;
    })
];

module.exports = {
  createBeritaValidation,
  updateBeritaValidation
};

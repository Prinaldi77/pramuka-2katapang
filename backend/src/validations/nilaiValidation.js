const { body } = require('express-validator');
const supabase = require('../config/supabase');

const createNilaiValidation = [
  body('siswa_id')
    .notEmpty().withMessage('Siswa ID wajib diisi')
    .isInt().withMessage('Siswa ID harus berupa angka')
    .custom(async (value) => {
      const { data, error } = await supabase
        .from('siswa')
        .select('id')
        .eq('id', value)
        .single();
      
      if (error || !data) {
        throw new Error('Siswa ID tidak ditemukan');
      }
      return true;
    }),
  body('kategori_nilai_id')
    .notEmpty().withMessage('Kategori nilai ID wajib diisi')
    .isInt().withMessage('Kategori nilai ID harus berupa angka')
    .custom(async (value) => {
      const { data, error } = await supabase
        .from('kategori_nilai')
        .select('id')
        .eq('id', value)
        .single();
      
      if (error || !data) {
        throw new Error('Kategori nilai ID tidak ditemukan');
      }
      return true;
    }),
  body('nilai')
    .notEmpty().withMessage('Nilai wajib diisi')
    .isInt({ min: 0, max: 100 }).withMessage('Nilai harus berupa angka antara 0 sampai 100')
];

const updateNilaiValidation = [
  body('nilai')
    .optional()
    .isInt({ min: 0, max: 100 }).withMessage('Nilai harus berupa angka antara 0 sampai 100')
];

module.exports = {
  createNilaiValidation,
  updateNilaiValidation
};

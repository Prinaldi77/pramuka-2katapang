const { body } = require('express-validator');
const supabase = require('../config/supabase');

const createPengurusValidation = [
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
  body('jabatan')
    .trim()
    .notEmpty().withMessage('Jabatan pengurus wajib diisi'),
  body('periode')
    .trim()
    .notEmpty().withMessage('Periode kepengurusan wajib diisi (contoh: 2025/2026)')
];

const updatePengurusValidation = [
  body('siswa_id')
    .optional()
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
  body('jabatan')
    .optional()
    .trim()
    .notEmpty().withMessage('Jabatan tidak boleh kosong'),
  body('periode')
    .optional()
    .trim()
    .notEmpty().withMessage('Periode tidak boleh kosong')
];

module.exports = {
  createPengurusValidation,
  updatePengurusValidation
};

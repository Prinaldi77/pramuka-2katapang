const { body } = require('express-validator');
const supabase = require('../config/supabase');

const createAbsensiValidation = [
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
  body('agenda_id')
    .notEmpty().withMessage('Agenda ID wajib diisi')
    .isInt().withMessage('Agenda ID harus berupa angka')
    .custom(async (value) => {
      const { data, error } = await supabase
        .from('agenda_absensi')
        .select('id')
        .eq('id', value)
        .single();
      
      if (error || !data) {
        throw new Error('Agenda ID tidak ditemukan');
      }
      return true;
    }),
  body('latitude')
    .notEmpty().withMessage('Latitude wajib diisi')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude harus bernilai antara -90 sampai 90'),
  body('longitude')
    .notEmpty().withMessage('Longitude wajib diisi')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude harus bernilai antara -180 sampai 180')
];

module.exports = {
  createAbsensiValidation
};

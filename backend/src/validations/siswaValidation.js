const { body } = require('express-validator');
const supabase = require('../config/supabase');

const createSiswaValidation = [
  body('user_id')
    .notEmpty().withMessage('User ID wajib diisi')
    .isInt().withMessage('User ID harus berupa angka')
    .custom(async (value) => {
      // Check if user exists and has role 'siswa'
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', value)
        .single();
      
      if (error || !user) {
        throw new Error('User ID tidak ditemukan');
      }
      if (user.role !== 'siswa') {
        throw new Error('User ID ini tidak ber-role siswa');
      }

      // Check if student profile already exists
      const { data: existingSiswa } = await supabase
        .from('siswa')
        .select('id')
        .eq('user_id', value);

      if (existingSiswa && existingSiswa.length > 0) {
        throw new Error('Profil siswa untuk User ID ini sudah terdaftar');
      }
      return true;
    }),
  body('nis')
    .trim()
    .notEmpty().withMessage('NIS wajib diisi')
    .custom(async (value) => {
      const { data, error } = await supabase
        .from('siswa')
        .select('id')
        .eq('nis', value);
      
      if (data && data.length > 0) {
        throw new Error('NIS sudah terdaftar');
      }
      return true;
    }),
  body('kelas')
    .trim()
    .notEmpty().withMessage('Kelas wajib diisi'),
  body('jenis_kelamin')
    .trim()
    .notEmpty().withMessage('Jenis kelamin wajib diisi')
    .isIn(['Laki-laki', 'Perempuan']).withMessage('Jenis kelamin harus Laki-laki atau Perempuan'),
  body('tempat_lahir').optional().trim(),
  body('tanggal_lahir')
    .optional()
    .isDate().withMessage('Tanggal lahir harus berformat YYYY-MM-DD'),
  body('nama_ortu').optional().trim(),
  body('no_hp_ortu').optional().trim()
];

const updateSiswaValidation = [
  body('nis')
    .optional()
    .trim()
    .notEmpty().withMessage('NIS tidak boleh kosong')
    .custom(async (value, { req }) => {
      const { data, error } = await supabase
        .from('siswa')
        .select('id')
        .eq('nis', value)
        .neq('id', req.params.id);
      
      if (data && data.length > 0) {
        throw new Error('NIS sudah terdaftar pada siswa lain');
      }
      return true;
    }),
  body('kelas')
    .optional()
    .trim()
    .notEmpty().withMessage('Kelas tidak boleh kosong'),
  body('jenis_kelamin')
    .optional()
    .trim()
    .isIn(['Laki-laki', 'Perempuan']).withMessage('Jenis kelamin harus Laki-laki atau Perempuan'),
  body('tempat_lahir').optional().trim(),
  body('tanggal_lahir')
    .optional()
    .isDate().withMessage('Tanggal lahir harus berformat YYYY-MM-DD'),
  body('nama_ortu').optional().trim(),
  body('no_hp_ortu').optional().trim()
];

module.exports = {
  createSiswaValidation,
  updateSiswaValidation
};

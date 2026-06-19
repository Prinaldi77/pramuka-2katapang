const { body } = require('express-validator');

const createPrestasiValidation = [
  body('nama_prestasi')
    .trim()
    .notEmpty().withMessage('Nama prestasi wajib diisi'),
  body('deskripsi')
    .optional()
    .trim(),
  body('tanggal')
    .notEmpty().withMessage('Tanggal prestasi wajib diisi')
    .isDate().withMessage('Tanggal harus berformat YYYY-MM-DD')
];

const updatePrestasiValidation = [
  body('nama_prestasi')
    .optional()
    .trim()
    .notEmpty().withMessage('Nama prestasi tidak boleh kosong'),
  body('deskripsi')
    .optional()
    .trim(),
  body('tanggal')
    .optional()
    .isDate().withMessage('Tanggal harus berformat YYYY-MM-DD')
];

module.exports = {
  createPrestasiValidation,
  updatePrestasiValidation
};

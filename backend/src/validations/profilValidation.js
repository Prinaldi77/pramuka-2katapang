const { body } = require('express-validator');

const updateProfilValidation = [
  body('nama_gudep')
    .optional()
    .trim()
    .notEmpty().withMessage('Nama Gudep tidak boleh kosong'),
  body('deskripsi')
    .optional()
    .trim(),
  body('visi')
    .optional()
    .trim(),
  body('misi')
    .optional()
    .trim(),
  body('alamat')
    .optional()
    .trim(),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Format email tidak valid'),
  body('telepon')
    .optional()
    .trim()
];

module.exports = {
  updateProfilValidation
};

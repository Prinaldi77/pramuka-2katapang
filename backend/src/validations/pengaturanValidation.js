const { body } = require('express-validator');

const updatePengaturanValidation = [
  body('nama_aplikasi')
    .optional()
    .trim()
    .notEmpty().withMessage('Nama aplikasi tidak boleh kosong'),
  body('footer')
    .optional()
    .trim()
    .notEmpty().withMessage('Footer tidak boleh kosong')
];

module.exports = {
  updatePengaturanValidation
};

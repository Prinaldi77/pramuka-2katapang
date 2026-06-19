const { body } = require('express-validator');

const createPesanValidation = [
  body('nama')
    .trim()
    .notEmpty().withMessage('Nama wajib diisi'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid'),
  body('subjek')
    .trim()
    .notEmpty().withMessage('Subjek wajib diisi'),
  body('pesan')
    .trim()
    .notEmpty().withMessage('Pesan wajib diisi')
];

module.exports = {
  createPesanValidation
};

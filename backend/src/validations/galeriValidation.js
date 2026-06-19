const { body } = require('express-validator');

const createGaleriValidation = [
  body('judul')
    .trim()
    .notEmpty().withMessage('Judul galeri wajib diisi')
];

module.exports = {
  createGaleriValidation
};

const { body } = require('express-validator');

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid'),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
];

module.exports = {
  loginValidation
};

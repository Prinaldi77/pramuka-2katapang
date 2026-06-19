const { body } = require('express-validator');

// Time validation regex (HH:MM or HH:MM:SS)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/;

const createAgendaValidation = [
  body('judul')
    .trim()
    .notEmpty().withMessage('Judul agenda wajib diisi'),
  body('tanggal')
    .notEmpty().withMessage('Tanggal agenda wajib diisi')
    .isDate().withMessage('Tanggal harus berformat YYYY-MM-DD'),
  body('jam_mulai')
    .notEmpty().withMessage('Jam mulai wajib diisi')
    .matches(timeRegex).withMessage('Jam mulai harus berformat HH:MM atau HH:MM:SS'),
  body('jam_selesai')
    .notEmpty().withMessage('Jam selesai wajib diisi')
    .matches(timeRegex).withMessage('Jam selesai harus berformat HH:MM atau HH:MM:SS'),
  body('latitude')
    .notEmpty().withMessage('Latitude wajib diisi')
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude harus bernilai antara -90 sampai 90'),
  body('longitude')
    .notEmpty().withMessage('Longitude wajib diisi')
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude harus bernilai antara -180 sampai 180'),
  body('radius')
    .notEmpty().withMessage('Radius wajib diisi')
    .isFloat({ min: 1 }).withMessage('Radius harus bernilai minimal 1 meter'),
  body('status')
    .optional()
    .isIn(['aktif', 'nonaktif']).withMessage('Status agenda harus aktif atau nonaktif')
];

const updateAgendaValidation = [
  body('judul')
    .optional()
    .trim()
    .notEmpty().withMessage('Judul tidak boleh kosong'),
  body('tanggal')
    .optional()
    .isDate().withMessage('Tanggal harus berformat YYYY-MM-DD'),
  body('jam_mulai')
    .optional()
    .matches(timeRegex).withMessage('Jam mulai harus berformat HH:MM atau HH:MM:SS'),
  body('jam_selesai')
    .optional()
    .matches(timeRegex).withMessage('Jam selesai harus berformat HH:MM atau HH:MM:SS'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude harus bernilai antara -90 sampai 90'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude harus bernilai antara -180 sampai 180'),
  body('radius')
    .optional()
    .isFloat({ min: 1 }).withMessage('Radius harus bernilai minimal 1 meter'),
  body('status')
    .optional()
    .isIn(['aktif', 'nonaktif']).withMessage('Status agenda harus aktif atau nonaktif')
];

module.exports = {
  createAgendaValidation,
  updateAgendaValidation
};

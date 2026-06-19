const { body } = require('express-validator');

const createKegiatanValidation = [
  body('nama_kegiatan')
    .trim()
    .notEmpty().withMessage('Nama kegiatan wajib diisi'),
  body('deskripsi')
    .optional()
    .trim(),
  body('tanggal')
    .notEmpty().withMessage('Tanggal kegiatan wajib diisi')
    .isDate().withMessage('Tanggal harus berformat YYYY-MM-DD'),
  body('lokasi')
    .optional()
    .trim()
];

const updateKegiatanValidation = [
  body('nama_kegiatan')
    .optional()
    .trim()
    .notEmpty().withMessage('Nama kegiatan tidak boleh kosong'),
  body('deskripsi')
    .optional()
    .trim(),
  body('tanggal')
    .optional()
    .isDate().withMessage('Tanggal harus berformat YYYY-MM-DD'),
  body('lokasi')
    .optional()
    .trim()
];

module.exports = {
  createKegiatanValidation,
  updateKegiatanValidation
};

const express = require('express');
const router = express.Router();
const kegiatanController = require('../controllers/kegiatanController');
const { createKegiatanValidation, updateKegiatanValidation } = require('../validations/kegiatanValidation');
const validate = require('../middleware/validatorMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, verifyPembina } = require('../middleware/authMiddleware');

// Get events details (Public)
router.get('/', kegiatanController.getKegiatan);
router.get('/stats', kegiatanController.getPublicStats);
router.get('/:id', kegiatanController.getKegiatanById);

// Create, Update, Delete events details (Pembina or Admin allowed)
router.post('/', verifyToken, verifyPembina, upload.single('gambar'), createKegiatanValidation, validate, kegiatanController.createKegiatan);
router.put('/:id', verifyToken, verifyPembina, upload.single('gambar'), updateKegiatanValidation, validate, kegiatanController.updateKegiatan);
router.delete('/:id', verifyToken, verifyPembina, kegiatanController.deleteKegiatan);

module.exports = router;

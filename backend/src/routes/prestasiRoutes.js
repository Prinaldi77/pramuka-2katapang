const express = require('express');
const router = express.Router();
const prestasiController = require('../controllers/prestasiController');
const { createPrestasiValidation, updatePrestasiValidation } = require('../validations/prestasiValidation');
const validate = require('../middleware/validatorMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, verifyPembina } = require('../middleware/authMiddleware');

// Get achievement details (Public)
router.get('/', prestasiController.getPrestasi);
router.get('/:id', prestasiController.getPrestasiById);

// Create, Update, Delete achievements (Pembina or Admin allowed)
router.post('/', verifyToken, verifyPembina, upload.single('gambar'), createPrestasiValidation, validate, prestasiController.createPrestasi);
router.put('/:id', verifyToken, verifyPembina, upload.single('gambar'), updatePrestasiValidation, validate, prestasiController.updatePrestasi);
router.delete('/:id', verifyToken, verifyPembina, prestasiController.deletePrestasi);

module.exports = router;

const express = require('express');
const router = express.Router();
const beritaController = require('../controllers/beritaController');
const { createBeritaValidation, updateBeritaValidation } = require('../validations/beritaValidation');
const validate = require('../middleware/validatorMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, verifyPembina } = require('../middleware/authMiddleware');

// Get news listings (Public)
router.get('/', beritaController.getBerita);
router.get('/:id', beritaController.getBeritaById);

// Create, Update, Delete news articles (Pembina or Admin can perform these)
router.post('/', verifyToken, verifyPembina, upload.single('gambar'), createBeritaValidation, validate, beritaController.createBerita);
router.put('/:id', verifyToken, verifyPembina, upload.single('gambar'), updateBeritaValidation, validate, beritaController.updateBerita);
router.delete('/:id', verifyToken, verifyPembina, beritaController.deleteBerita);

module.exports = router;

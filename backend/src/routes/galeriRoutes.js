const express = require('express');
const router = express.Router();
const galeriController = require('../controllers/galeriController');
const { createGaleriValidation } = require('../validations/galeriValidation');
const validate = require('../middleware/validatorMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, verifyPembina } = require('../middleware/authMiddleware');

// Get gallery items (Public)
router.get('/', galeriController.getGaleri);
router.get('/:id', galeriController.getGaleriById);

// Create and Delete gallery items (Pembina or Admin allowed)
router.post('/', verifyToken, verifyPembina, upload.single('gambar'), createGaleriValidation, validate, galeriController.createGaleri);
router.delete('/:id', verifyToken, verifyPembina, galeriController.deleteGaleri);

module.exports = router;

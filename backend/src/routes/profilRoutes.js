const express = require('express');
const router = express.Router();
const profilController = require('../controllers/profilController');
const { updateProfilValidation } = require('../validations/profilValidation');
const validate = require('../middleware/validatorMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Get profile details (Public)
router.get('/', profilController.getProfil);

// Update profile details (Admin only, handles single image upload for logo field)
router.put('/', verifyToken, verifyAdmin, upload.single('logo'), updateProfilValidation, validate, profilController.updateProfil);

module.exports = router;

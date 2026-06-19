const express = require('express');
const router = express.Router();
const pengaturanController = require('../controllers/pengaturanController');
const { updatePengaturanValidation } = require('../validations/pengaturanValidation');
const validate = require('../middleware/validatorMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Get settings configuration (Public)
router.get('/', pengaturanController.getPengaturan);

// Update settings configuration (Admin only, handles multiple image uploads)
router.put('/', 
  verifyToken, 
  verifyAdmin, 
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 }
  ]), 
  updatePengaturanValidation, 
  validate, 
  pengaturanController.updatePengaturan
);

module.exports = router;

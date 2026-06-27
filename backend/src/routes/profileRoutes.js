const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/authMiddleware');

// Get personal profile details (protected)
router.get('/me', verifyToken, profileController.getMe);

// Update personal profile details (protected)
router.put('/update', verifyToken, profileController.updateProfile);

module.exports = router;

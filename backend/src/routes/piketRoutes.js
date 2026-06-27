const express = require('express');
const router = express.Router();
const piketController = require('../controllers/piketController');
const { verifyToken, verifyPembina } = require('../middleware/authMiddleware');

// Get duty rosters (All authenticated users: Siswa, Pembina, Admin)
router.get('/', verifyToken, piketController.getPiket);

// Update duty roster by ID (Pembina/Admin only)
router.put('/:id', verifyToken, verifyPembina, piketController.updatePiket);

module.exports = router;

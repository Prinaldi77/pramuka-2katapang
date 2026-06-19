const express = require('express');
const router = express.Router();
const androidAbsensiController = require('../controllers/androidAbsensiController');
const { verifyToken, verifyPembina } = require('../middleware/authMiddleware');

// Get all android attendance logs
router.get('/', verifyToken, verifyPembina, androidAbsensiController.getAndroidAbsensiLogs);

// Get all android kegiatan for filtering
router.get('/kegiatan', verifyToken, verifyPembina, androidAbsensiController.getAndroidKegiatanList);

module.exports = router;

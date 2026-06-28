const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get active activity (student only)
router.get('/current-activity', verifyToken, attendanceController.getCurrentActivity);

// Get attendance status (student only)
router.get('/status', verifyToken, attendanceController.getAttendanceStatus);

// Post checkin (student only)
router.post('/checkin', verifyToken, upload.single('selfie'), attendanceController.checkIn);

// Post permit (student only)
router.post('/permit', verifyToken, upload.single('document'), attendanceController.submitPermit);

// Get today attendance (student only)
router.get('/today', verifyToken, attendanceController.getTodayAttendance);

module.exports = router;

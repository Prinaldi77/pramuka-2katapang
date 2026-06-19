const express = require('express');
const router = express.Router();
const absensiController = require('../controllers/absensiController');
const { createAbsensiValidation } = require('../validations/absensiValidation');
const validate = require('../middleware/validatorMiddleware');
const { verifyToken, verifyPembina, verifySiswa } = require('../middleware/authMiddleware');

// Student submits GPS check-in (restricted to student role)
router.post('/', verifyToken, verifySiswa, createAbsensiValidation, validate, absensiController.createAbsensi);

// View attendance logs by student ID (Authenticated: Student can view their own, Pembina/Admin can view all)
router.get('/siswa/:siswaId', verifyToken, absensiController.getAbsensiBySiswa);

// View attendance logs (Restricted to Pembina or Admin)
router.get('/', verifyToken, verifyPembina, absensiController.getAbsensi);
router.get('/:id', verifyToken, verifyPembina, absensiController.getAbsensiById);
router.get('/agenda/:agendaId', verifyToken, verifyPembina, absensiController.getAbsensiByAgenda);

module.exports = router;

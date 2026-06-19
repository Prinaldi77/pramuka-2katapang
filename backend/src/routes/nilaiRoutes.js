const express = require('express');
const router = express.Router();
const nilaiController = require('../controllers/nilaiController');
const { createNilaiValidation, updateNilaiValidation } = require('../validations/nilaiValidation');
const validate = require('../middleware/validatorMiddleware');
const { verifyToken, verifyPembina } = require('../middleware/authMiddleware');

// Get report card (Rapor) - accessible by any authenticated user (Student can see their own, Pembina/Admin can see all)
router.get('/rapor/:siswaId', verifyToken, nilaiController.getRaporSiswa);

// Get student individual grades - accessible by authenticated users
router.get('/:siswaId', verifyToken, nilaiController.getNilaiBySiswa);

// CRUD operations on grades - restricted to Pembina and Admin
router.get('/', verifyToken, verifyPembina, nilaiController.getNilai);
router.post('/', verifyToken, verifyPembina, createNilaiValidation, validate, nilaiController.createNilai);
router.put('/:id', verifyToken, verifyPembina, updateNilaiValidation, validate, nilaiController.updateNilai);
router.delete('/:id', verifyToken, verifyPembina, nilaiController.deleteNilai);

module.exports = router;

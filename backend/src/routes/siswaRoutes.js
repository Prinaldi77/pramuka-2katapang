const express = require('express');
const router = express.Router();
const siswaController = require('../controllers/siswaController');
const { createSiswaValidation, updateSiswaValidation } = require('../validations/siswaValidation');
const validate = require('../middleware/validatorMiddleware');
const { verifyToken, verifyAdmin, verifyPembina } = require('../middleware/authMiddleware');

// Get endpoints are accessible by Pembina and Admin
router.get('/', verifyToken, verifyPembina, siswaController.getSiswa);
router.get('/:id', verifyToken, verifyPembina, siswaController.getSiswaById);

// Create, Update, Delete endpoints are restricted to Admin only
router.post('/', verifyToken, verifyAdmin, createSiswaValidation, validate, siswaController.createSiswa);
router.put('/:id', verifyToken, verifyAdmin, updateSiswaValidation, validate, siswaController.updateSiswa);
router.delete('/:id', verifyToken, verifyAdmin, siswaController.deleteSiswa);

module.exports = router;

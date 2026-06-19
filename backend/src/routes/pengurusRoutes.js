const express = require('express');
const router = express.Router();
const pengurusController = require('../controllers/pengurusController');
const { createPengurusValidation, updatePengurusValidation } = require('../validations/pengurusValidation');
const validate = require('../middleware/validatorMiddleware');
const { verifyToken, verifyAdmin, verifyPembina } = require('../middleware/authMiddleware');

// Get all council members (Public)
router.get('/', pengurusController.getPengurus);

// Get single member details (Pembina and Admin)
router.get('/:id', verifyToken, verifyPembina, pengurusController.getPengurusById);

// Create, Update, and Delete members (Admin only)
router.post('/', verifyToken, verifyAdmin, createPengurusValidation, validate, pengurusController.createPengurus);
router.put('/:id', verifyToken, verifyAdmin, updatePengurusValidation, validate, pengurusController.updatePengurus);
router.delete('/:id', verifyToken, verifyAdmin, pengurusController.deletePengurus);

module.exports = router;

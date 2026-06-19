const express = require('express');
const router = express.Router();
const pesanController = require('../controllers/pesanController');
const { createPesanValidation } = require('../validations/pesanValidation');
const validate = require('../middleware/validatorMiddleware');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Public route to send a message
router.post('/', createPesanValidation, validate, pesanController.createPesan);

// Protected routes (Admin only)
router.get('/', verifyToken, verifyAdmin, pesanController.getPesan);
router.get('/:id', verifyToken, verifyAdmin, pesanController.getPesanById);
router.delete('/:id', verifyToken, verifyAdmin, pesanController.deletePesan);
router.patch('/:id/read', verifyToken, verifyAdmin, pesanController.markAsRead);

module.exports = router;

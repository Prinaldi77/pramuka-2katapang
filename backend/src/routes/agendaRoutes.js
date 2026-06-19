const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const { createAgendaValidation, updateAgendaValidation } = require('../validations/agendaValidation');
const validate = require('../middleware/validatorMiddleware');
const { verifyToken, verifyPembina } = require('../middleware/authMiddleware');

// Get all/single agenda (Any authenticated user: Siswa, Pembina, Admin)
router.get('/', verifyToken, agendaController.getAgenda);
router.get('/:id', verifyToken, agendaController.getAgendaById);

// Create, Update, and Delete agendas (Pembina or Admin only)
router.post('/', verifyToken, verifyPembina, createAgendaValidation, validate, agendaController.createAgenda);
router.put('/:id', verifyToken, verifyPembina, updateAgendaValidation, validate, agendaController.updateAgenda);
router.delete('/:id', verifyToken, verifyPembina, agendaController.deleteAgenda);

module.exports = router;

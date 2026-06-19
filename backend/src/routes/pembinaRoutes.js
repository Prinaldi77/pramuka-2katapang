const express = require('express');
const router = express.Router();
const pembinaController = require('../controllers/pembinaController');
const { createPembinaValidation, updatePembinaValidation } = require('../validations/pembinaValidation');
const validate = require('../middleware/validatorMiddleware');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// All Pembina CRUD endpoints are restricted to Admin role
router.use(verifyToken);
router.use(verifyAdmin);

router.get('/', pembinaController.getPembina);
router.get('/:id', pembinaController.getPembinaById);
router.post('/', createPembinaValidation, validate, pembinaController.createPembina);
router.put('/:id', updatePembinaValidation, validate, pembinaController.updatePembina);
router.delete('/:id', pembinaController.deletePembina);

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { createUserValidation, updateUserValidation } = require('../validations/userValidation');
const validate = require('../middleware/validatorMiddleware');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Apply verifyToken and verifyAdmin middleware to all user CRUD endpoints
router.use(verifyToken);
router.use(verifyAdmin);

// CRUD Endpoints for Users
router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', createUserValidation, validate, userController.createUser);
router.put('/:id', updateUserValidation, validate, userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { loginValidation } = require('../validations/authValidation');
const validate = require('../middleware/validatorMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');

// Route for Login
router.post('/login', loginValidation, validate, authController.login);

// Route for Logout
router.post('/logout', authController.logout);

// Route for Profile (protected)
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;

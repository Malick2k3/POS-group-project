const express = require('express');
const router = express.Router();
const { login, register, getCurrentUser } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');
const { validateAuthLogin, validateAuthRegistration } = require('../middleware/validators');

// Public routes
router.post('/login', authLimiter, validateAuthLogin, login);
router.post('/register', authLimiter, validateAuthRegistration, register);

// Protected routes
router.get('/me', verifyToken, getCurrentUser);

module.exports = router; 

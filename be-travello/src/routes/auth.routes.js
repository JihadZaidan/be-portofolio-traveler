const express = require('express');
const { register, login, getProfile, logout } = require('../controllers/auth.controller.js');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Get current user profile (protected)
router.get('/profile', authenticateToken, getProfile);

// Logout user
router.post('/logout', logout);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getUserProfile } = require('../controllers/user.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Get user profile
router.get('/profile', authenticateToken, getUserProfile);

module.exports = router;

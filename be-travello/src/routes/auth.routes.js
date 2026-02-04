const { Router } = require('express');
const { passport } = require('../config/passport.config.js');
const { generateToken } = require('../config/passport.config.js');
const AuthController = require('../controllers/auth.controller.js');

const router = Router();

// Basic auth routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getMe);

module.exports = router;

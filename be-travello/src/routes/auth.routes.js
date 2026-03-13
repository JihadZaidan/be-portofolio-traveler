const express = require('express');
const passport = require('../config/passport.config');
const { register, login, getProfile, logout, googleSuccess, googleFailure, forgotPassword, resetPassword, updateProfile, changePassword } = require('../controllers/auth.controller.js');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Forgot password
router.post('/forgot-password', forgotPassword);

// Reset password
router.post('/reset-password', resetPassword);

// Get current user profile (protected)
router.get('/profile', authenticateToken, getProfile);

// Update user profile (protected)
router.put('/profile', authenticateToken, updateProfile);

// Change password (protected)
router.put('/change-password', authenticateToken, changePassword);

// Logout user
router.post('/logout', logout);

// Google OAuth routes
router.get('/google', (req, res, next) => {
    const options = {
        scope: ['profile', 'email'],
        prompt: 'select_account',
        accessType: 'offline' // Get refresh token
    };
    
    // Preserve custom parameters in the state
    const state = {
        mode: req.query.mode || 'login',
        login_page: req.query.login_page || 'default'
    };
    
    // Encode state parameter
    options.state = Buffer.from(JSON.stringify(state)).toString('base64');
    
    console.log('🔗 Google OAuth Init:', {
        scope: options.scope,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        state: state
    });
    
    passport.authenticate('google', options)(req, res, next);
});

router.get('/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/api/auth/error',
        session: false,
        failureMessage: true
    }),
    (req, res) => {
        try {
            console.log('🔄 Google OAuth Callback received:', {
                user: req.user,
                query: req.query,
                params: req.params
            });
            googleSuccess(req, res);
        } catch (error) {
            console.error('❌ Google callback error:', error);
            const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent('Callback processing failed: ' + error.message)}`);
        }
    }
);

router.get('/google/failure', googleFailure);

router.get('/error', (req, res) => {
    const message = req.query.message || 'Authentication failed';
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=${encodeURIComponent(message)}`);
});

module.exports = router;

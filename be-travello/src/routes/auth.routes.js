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

// Google OAuth - Using Passport Strategy
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false
}));

// Google OAuth callback - Using Passport Strategy
router.get('/google/callback', 
  passport.authenticate('google', { 
    session: false,
    failureRedirect: '/api/auth/google/failure'
  }),
  (req, res) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Google OAuth authentication failed',
          error: 'No user data received'
        });
      }

      // Generate JWT token
      const token = generateToken(user);

      // Always return JSON response - no redirects to admin pages
      res.json({
        success: true,
        message: 'Google OAuth authentication successful',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            profilePicture: user.profilePicture,
            role: user.role,
            isEmailVerified: user.isEmailVerified
          },
          token,
          instructions: 'Use this token for authenticated requests'
        }
      });
    } catch (error) {
      console.error('Google OAuth callback processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process Google OAuth callback',
        error: error.message
      });
    }
  }
);

// Google OAuth failure handler
router.get('/google/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Google OAuth authentication failed',
    error: 'User denied access or authentication failed'
  });
});

// Check OAuth configuration
router.get('/config', (req, res) => {
  try {
    const config = {
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Not configured',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'Not set',
      corsOrigin: process.env.CORS_ORIGIN || 'Not set',
      jwtSecret: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
      sessionSecret: process.env.SESSION_SECRET ? 'Configured' : 'Not configured'
    };

    res.json({
      success: true,
      data: {
        config,
        message: 'Google OAuth configuration check'
      }
    });
  } catch (error) {
    console.error('Config check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check configuration',
      error: error.message
    });
  }
});

module.exports = router;

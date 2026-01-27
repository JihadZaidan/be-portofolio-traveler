import { Router, Request, Response } from 'express';
import passport from 'passport';
import AuthController from '../controllers/auth.controller.js';
import { generateToken } from '../config/passport.config.js';
import { User } from '../models/User.model.js';

const router = Router();

// Local Authentication
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
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
  (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Google OAuth authentication failed',
          error: 'No user data received'
        });
      }

      // Generate JWT token
      const token = generateToken(user);

      // For Swagger UI and API clients, return JSON response
      if (req.headers.accept?.includes('application/json')) {
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
      } else {
        // For web browsers, redirect to frontend with token
        const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=success&token=${token}`;
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Google OAuth callback processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process Google OAuth callback',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// Google OAuth failure handler
router.get('/google/failure', (req: Request, res: Response) => {
  res.status(401).json({
    success: false,
    message: 'Google OAuth authentication failed',
    error: 'User denied access or authentication failed'
  });
});

// Check OAuth configuration
router.get('/config', (req: Request, res: Response) => {
  try {
    const config = {
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Not configured',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'Not set',
      corsOrigin: process.env.CORS_ORIGIN || 'Not set',
      geminiApiKey: process.env.GEMINI_API_KEY ? 'Configured' : 'Not configured',
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
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

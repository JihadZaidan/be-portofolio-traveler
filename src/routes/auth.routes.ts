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

// Google OAuth
router.get('/google', (req: Request, res: Response) => {
  try {
    const redirectUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL!)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('profile email')}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log('Redirecting to Google OAuth:', redirectUrl);
    
    // For Swagger UI and API clients, return JSON with the URL
    if (req.headers.accept?.includes('application/json')) {
      res.json({
        success: true,
        message: 'Google OAuth URL generated',
        data: {
          authUrl: redirectUrl,
          instructions: 'Visit the authUrl above to authenticate with Google'
        }
      });
    } else {
      // For web browsers, redirect directly
      passport.authenticate('google', { scope: ['profile', 'email'] })(req, res);
    }
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Google OAuth',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req: Request, res: Response) => {
    try {
      const user = req.user as User;
      const token = generateToken(user);
      
      // Set token in HTTP-only cookie
      res.cookie('token', token, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // For Swagger UI and API clients, return JSON with token
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
              isEmailVerified: user.isEmailVerified,
              lastLogin: user.lastLogin,
              createdAt: user.createdAt
            },
            token,
            instructions: 'Use this token for authenticated requests'
          }
        });
      } else {
        // For web browsers, redirect to frontend
        res.redirect('/');
      }
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      
      // For Swagger UI and API clients, return JSON error
      if (req.headers.accept?.includes('application/json')) {
        res.status(500).json({
          success: false,
          message: 'Google OAuth callback failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } else {
        res.redirect('/login?error=auth_failed');
      }
    }
  }
);

export default router;

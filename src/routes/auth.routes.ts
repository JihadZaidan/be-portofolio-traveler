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

// Google OAuth - Direct implementation
router.get('/google', (req: Request, res: Response) => {
  console.log('Google OAuth endpoint hit:', req.path, req.method);
  
  try {
    // Check if Google OAuth is configured
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CALLBACK_URL) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth not configured',
        error: 'Missing Google OAuth credentials'
      });
    }

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
          instructions: 'Visit the authUrl above to authenticate with Google',
          clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
          callbackUrl: process.env.GOOGLE_CALLBACK_URL
        }
      });
    } else {
      // For web browsers, redirect directly
      res.redirect(redirectUrl);
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

// Google OAuth callback - Direct implementation
router.get('/google/callback', (req: Request, res: Response) => {
  console.log('Google OAuth callback endpoint hit:', req.path, req.method);
  
  try {
    // For Swagger UI and API clients, return JSON response
    if (req.headers.accept?.includes('application/json')) {
      res.json({
        success: true,
        message: 'Google OAuth callback endpoint',
        data: {
          instructions: 'This endpoint handles Google OAuth callback',
          note: 'In production, this would process the OAuth code and return user data with token'
        }
      });
    } else {
      // For web browsers, redirect to frontend
      const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=callback_received`;
      res.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({
      success: false,
      message: 'Google OAuth callback failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

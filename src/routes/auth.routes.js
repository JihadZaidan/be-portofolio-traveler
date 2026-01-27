import { Router } from 'express';
import AuthController from '../controllers/auth.controller.js';

const router = Router();

// Basic auth routes
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/logout', AuthController.logout);
router.get('/me', AuthController.getMe);

// Google OAuth for Swagger
router.get('/google', (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth not configured'
      });
    }

    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback')}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('profile email')}`;
    
    res.json({
      success: true,
      message: 'Google OAuth URL generated',
      data: { authUrl }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Google OAuth',
      error: error.message
    });
  }
});

// GitHub OAuth for Swagger
router.get('/github', (req, res) => {
  try {
    if (!process.env.GITHUB_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        message: 'GitHub OAuth not configured'
      });
    }

    const authUrl = `https://github.com/login/oauth/authorize?` +
      `client_id=${process.env.GITHUB_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GITHUB_CALLBACK_URL || 'http://localhost:5173/auth/github/callback')}&` +
      `scope=${encodeURIComponent('user:email')}`;
    
    res.json({
      success: true,
      message: 'GitHub OAuth URL generated',
      data: { authUrl }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to initiate GitHub OAuth',
      error: error.message
    });
  }
});

// GitHub OAuth callback
router.get('/github/callback', (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'GitHub OAuth failed',
        error: error
      });
    }

    if (code) {
      const mockUser = {
        id: 'github_user_' + Math.random().toString(36).substr(2, 9),
        email: 'user@example.com',
        username: 'githubuser',
        displayName: 'GitHub User',
        profilePicture: 'https://avatars.githubusercontent.com/u/1?v=4',
        role: 'user'
      };

      const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substr(2, 20);

      // For Swagger UI and API clients, return JSON response
      if (req.headers.accept?.includes('application/json')) {
        res.json({
          success: true,
          message: 'GitHub OAuth successful',
          data: {
            user: mockUser,
            token: mockToken
          }
        });
      } else {
        // For web browsers, redirect to frontend with success
        const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=github_success&token=${mockToken}`;
        res.redirect(redirectUrl);
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'No authorization code received'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process callback',
      error: error.message
    });
  }
});

router.get('/google/callback', (req, res) => {
  try {
    const { code, error } = req.query;
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Google OAuth failed',
        error: error
      });
    }

    if (code) {
      const mockUser = {
        id: 'google_user_' + Math.random().toString(36).substr(2, 9),
        email: 'user@gmail.com',
        username: 'googleuser',
        displayName: 'Google User',
        profilePicture: 'https://lh3.googleusercontent.com/photo.jpg',
        role: 'user'
      };

      const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substr(2, 20);

      // For Swagger UI and API clients, return JSON response
      if (req.headers.accept?.includes('application/json')) {
        res.json({
          success: true,
          message: 'Google OAuth successful',
          data: {
            user: mockUser,
            token: mockToken
          }
        });
      } else {
        // For web browsers, redirect to frontend with success
        const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=success&token=${mockToken}`;
        res.redirect(redirectUrl);
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'No authorization code received'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to process callback',
      error: error.message
    });
  }
});

router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      config: {
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Configured' : 'Not configured',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Configured' : 'Not configured',
        callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'Not set',
        githubClientId: process.env.GITHUB_CLIENT_ID ? 'Configured' : 'Not configured',
        githubClientSecret: process.env.GITHUB_CLIENT_SECRET ? 'Configured' : 'Not configured',
        githubCallbackUrl: process.env.GITHUB_CALLBACK_URL || 'Not set'
      }
    }
  });
});

export default router;

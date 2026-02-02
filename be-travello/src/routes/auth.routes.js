import { Router } from 'express';
import passport from '../config/passport.config.js';
import { generateToken } from '../config/passport.config.js';
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

// GitHub OAuth callback with Passport
router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=github_auth_failed`, session: false }),
  async (req, res) => {
    try {
      console.log('GitHub OAuth callback successful, user:', req.user);
      
      if (!req.user) {
        throw new Error('User not found in GitHub OAuth callback');
      }
      
      // Generate JWT token
      const token = generateToken(req.user);
      
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
          message: 'GitHub OAuth authentication successful',
          data: {
            user: {
              id: req.user.id,
              email: req.user.email,
              username: req.user.username,
              displayName: req.user.displayName || req.user.username
            },
            token,
            instructions: 'Use this token for authenticated requests'
          }
        });
      } else {
        // Redirect to frontend with success
        const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=github_success&token=${token}`;
        console.log('Redirecting to frontend:', redirectUrl);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('GitHub OAuth callback error:', error);
      
      // For Swagger UI and API clients, return JSON error
      if (req.headers.accept?.includes('application/json')) {
        res.status(500).json({
          success: false,
          message: 'GitHub OAuth callback failed',
          error: error.message || 'Unknown error'
        });
      } else {
        const errorUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=callback_failed`;
        res.redirect(errorUrl);
      }
    }
  }
);

// Google OAuth callback with Passport
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=google_auth_failed`, session: false }),
  async (req, res) => {
    try {
      console.log('Google OAuth callback successful, user:', req.user);
      
      if (!req.user) {
        throw new Error('User not found in Google OAuth callback');
      }
      
      // Generate JWT token
      const token = generateToken(req.user);
      
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
              id: req.user.id,
              email: req.user.email,
              username: req.user.username,
              displayName: req.user.displayName || req.user.username
            },
            token,
            instructions: 'Use this token for authenticated requests'
          }
        });
      } else {
        // Redirect to frontend with success
        const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=google_success&token=${token}`;
        console.log('Redirecting to frontend:', redirectUrl);
        res.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      
      // For Swagger UI and API clients, return JSON error
      if (req.headers.accept?.includes('application/json')) {
        res.status(500).json({
          success: false,
          message: 'Google OAuth callback failed',
          error: error.message || 'Unknown error'
        });
      } else {
        const errorUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=google_callback_failed`;
        res.redirect(errorUrl);
      }
    }
  }
);

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

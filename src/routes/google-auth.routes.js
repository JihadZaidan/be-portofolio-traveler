import { Router } from 'express';
import passport from '../config/passport.config.js';
import { generateToken, verifyToken } from '../config/passport.config.js';
import { User } from '../models/User.model.js';

const router = Router();

// Google OAuth login endpoint
router.get('/google', (req, res) => {
  try {
    const redirectUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('profile email')}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log('Redirecting to Google OAuth:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Google OAuth initiation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate Google OAuth'
    });
  }
});

// Google OAuth callback endpoint
router.get('/google/callback', 
  (req, res, next) => {
    passport.authenticate('google', { 
      failureRedirect: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=google_auth_failed`,
      session: false,
      failWithError: true
    })(req, res, next);
  },
  async (req, res) => {
    try {
      console.log('Google OAuth callback successful, user:', req.user);
      
      if (!req.user) {
        throw new Error('User not found in OAuth callback');
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
              username: req.user.username,
              email: req.user.email,
              displayName: req.user.displayName,
              profilePicture: req.user.profilePicture,
              role: req.user.role,
              isEmailVerified: req.user.isEmailVerified,
              lastLogin: req.user.lastLogin,
              createdAt: req.user.createdAt
            },
            token,
            instructions: 'Use this token for authenticated requests'
          }
        });
      } else {
        // Redirect to frontend with success
        const redirectUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=success&token=${token}`;
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
        const errorUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=callback_failed`;
        res.redirect(errorUrl);
      }
    }
  }
);

// Error handler for OAuth failures
router.use((error, req, res, next) => {
  console.error('OAuth Error:', error);
  
  if (req.headers.accept?.includes('application/json')) {
    res.status(401).json({
      success: false,
      message: 'OAuth authentication failed',
      error: error.message || 'Authentication error'
    });
  } else {
    const errorUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=${encodeURIComponent(error.message || 'oauth_failed')}`;
    res.redirect(errorUrl);
  }
});

// Check Google OAuth configuration
router.get('/config', (req, res) => {
  try {
    const config = {
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
      corsOrigin: process.env.CORS_ORIGIN
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
      message: 'Failed to check configuration'
    });
  }
});

// Get current user info (for frontend)
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = verifyToken(token);
    
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    return res.json({
      success: true,
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
        token
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;

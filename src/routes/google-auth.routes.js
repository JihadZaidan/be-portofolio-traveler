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
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=google_auth_failed`,
    session: false
  }),
  async (req, res) => {
    try {
      console.log('Google OAuth callback successful, user:', req.user);
      
      // Generate JWT token
      const token = generateToken(req.user);
      
      // Set token in HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Redirect to frontend with token
      const redirectUrl = `http://localhost:5173/auth/callback?auth=success&token=${token}`;
      console.log('Redirecting to frontend:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      const errorUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=callback_failed`;
      res.redirect(errorUrl);
    }
  }
);

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

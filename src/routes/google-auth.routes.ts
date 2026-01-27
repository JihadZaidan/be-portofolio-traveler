import { Router, Request, Response, NextFunction } from 'express';
import passport from '../config/passport.config.js';
import { generateToken, verifyToken } from '../config/passport.config.js';
import { User } from '../models/User.model.js';

const router = Router();

console.log('Google Auth Routes loaded');

// Google OAuth login endpoint
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

// Google OAuth callback endpoint
router.get('/google/callback', 
  (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('google', { 
      failureRedirect: `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=google_auth_failed`,
      session: false,
      failWithError: true
    })(req, res, next);
  },
  async (req: Request, res: Response) => {
    try {
      console.log('Google OAuth callback successful, user:', req.user);
      
      if (!req.user) {
        throw new Error('User not found in OAuth callback');
      }
      
      // Generate JWT token
      const token = generateToken(req.user as User);
      
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
              id: (req.user as User).id,
              username: (req.user as User).username,
              email: (req.user as User).email,
              displayName: (req.user as User).displayName,
              profilePicture: (req.user as User).profilePicture,
              role: (req.user as User).role,
              isEmailVerified: (req.user as User).isEmailVerified,
              lastLogin: (req.user as User).lastLogin,
              createdAt: (req.user as User).createdAt
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
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      } else {
        const errorUrl = `${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=error&message=callback_failed`;
        res.redirect(errorUrl);
      }
    }
  }
);

// Error handler for OAuth failures
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
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
router.get('/config', (req: Request, res: Response) => {
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
router.get('/me', async (req: Request, res: Response) => {
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
      message: 'Invalid token',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  try {
    res.clearCookie('token');
    
    // Check if request expects JSON (Swagger UI/API clients)
    if (req.headers.accept?.includes('application/json')) {
      res.json({
        success: true,
        message: 'Logged out successfully',
        data: {
          instructions: 'Token has been cleared from cookies'
        }
      });
    } else {
      // For web browsers, redirect to login page
      res.redirect(`${process.env.CORS_ORIGIN || 'http://localhost:5173'}?auth=logged_out`);
    }
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;

const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // For development, accept mock tokens and login tokens
  if (token.startsWith('mock_jwt_token_') || token.includes('_login_token_') || token.includes('_signup_token_')) {
    // Extract user ID from token
    const tokenParts = token.split('_');
    const userId = tokenParts[tokenParts.length - 2] || 'user_123';
    
    req.user = {
      id: userId,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    next();
  });
};

// Optional authentication middleware
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    // For development, accept mock tokens and login tokens
    if (token.startsWith('mock_jwt_token_') || token.includes('_login_token_') || token.includes('_signup_token_')) {
      // Extract user ID from token
      const tokenParts = token.split('_');
      const userId = tokenParts[tokenParts.length - 2] || 'user_123';
      
      req.user = {
        id: userId,
        username: 'testuser',
        email: 'test@example.com',
        role: 'user'
      };
    } else {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
        if (!err) {
          req.user = user;
        }
      });
    }
  }

  next();
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin
};

const { User, initUser } = require('../models/User.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Initialize User model
const initController = async () => {
  await initUser();
};

// Admin authentication controller
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({
      where: { 
        email: email.toLowerCase(),
        role: 'admin' // Only allow admin users
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    let isPasswordValid = false;
    if (user.password) {
      // If password is hashed, compare with bcrypt
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // For development: allow plain text comparison
      isPasswordValid = password === user.password;
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { 
        expiresIn: '24h',
        issuer: 'travello-admin'
      }
    );

    // Return success response
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        token: token,
        expiresIn: '24h'
      }
    });

  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Verify admin token
const verifyAdminToken = async (req, res) => {
  try {
    const user = req.user; // From auth middleware

    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    res.json({
      success: true,
      message: 'Admin token verified',
      data: {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('❌ Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed'
    });
  }
};

module.exports = {
  initController,
  adminLogin,
  verifyAdminToken
};

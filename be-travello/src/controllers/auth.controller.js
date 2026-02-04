const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../config/passport.config.js');
const { User, findByEmail, create, initUser } = require('../models/User.model.js');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      // Find user by email in userlist table (phpMyAdmin)
      let user = await findByEmail(email);
      
      if (!user) {
        // Create new user jika tidak ada (universal access)
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const userData = {
          username: email.split('@')[0] + Math.floor(Math.random() * 1000),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'user',
          isEmailVerified: true,
          displayName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
        };
        
        user = await create(userData);
        console.log('✅ New user created in users table (phpMyAdmin):', user.toJSON());
      } else {
        // Verify password untuk existing user
        if (user.password && password) {
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            res.status(401).json({
              success: false,
              message: 'Invalid email or password'
            });
            return;
          }
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
        console.log('✅ Existing user logged in from users table (phpMyAdmin):', user.toJSON());
      }

      // Generate token
      const token = generateToken(user);

      // Return response
      res.status(200).json({
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName || user.username
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.',
        error: error.message
      });
    }
  }

  static async register(req, res) {
    try {
      const { username, email, password, displayName } = req.body;

      // Minimal validation - hanya cek field required
      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
        return;
      }

      // Auto-generate username jika tidak ada
      const finalUsername = username || email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      // Auto-generate displayName jika tidak ada
      const finalDisplayName = displayName || finalUsername;

      // Check if user already exists in users table (phpMyAdmin)
      const existingUser = await findByEmail(email);
      if (existingUser) {
        // Jika user sudah ada, langsung login saja
        const token = generateToken(existingUser);
        
        res.status(200).json({
          success: true,
          message: 'Welcome back! You are now logged in.',
          data: {
            user: {
              id: existingUser.id,
              email: existingUser.email,
              username: existingUser.username,
              displayName: existingUser.displayName || existingUser.username
            },
            token
          }
        });
        return;
      }

      // Hash password (jika ada)
      let hashedPassword = password;
      if (password && password.length > 0) {
        hashedPassword = await bcrypt.hash(password, 12);
      }

      // Create new user dengan role default 'user' di users table (phpMyAdmin)
      const userData = {
        username: finalUsername.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'user',
        isEmailVerified: true, // Auto-verify
        displayName: finalDisplayName.trim()
      };

      const newUser = await create(userData);
      console.log('✅ New user created in users table (phpMyAdmin):', newUser.toJSON());

      // Generate token untuk auto-login
      const token = generateToken(newUser);

      // Update last login
      newUser.lastLogin = new Date();
      await newUser.save();

      res.status(201).json({
        success: true,
        message: 'Registration successful! You are now logged in.',
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            username: newUser.username,
            displayName: newUser.displayName || newUser.username
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        error: error.message
      });
    }
  }

  static async logout(req, res) {
    try {
      res.clearCookie('token');
      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getMe(req, res) {
    try {
      const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'No token provided'
        });
        return;
      }

      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            displayName: user.displayName || user.username
          }
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;

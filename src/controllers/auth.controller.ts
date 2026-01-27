import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../config/passport.config.js';
import { User, findByEmail } from '../models/User.model.js';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user?: {
      id: string;
      username: string;
      email: string;
      displayName?: string;
      role: string;
      isEmailVerified: boolean;
      lastLogin?: Date;
      createdAt: Date;
    };
    token?: string;
  };
  error?: string;
}

class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginRequest = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email and password are required'
        } as AuthResponse);
        return;
      }

      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        } as AuthResponse);
        return;
      }

      // Find user by email (case insensitive)
      const user = await findByEmail(email.toLowerCase().trim());

      if (!user || !user.password) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.'
        } as AuthResponse);
        return;
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials.'
        } as AuthResponse);
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user);

      res.json({
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          },
          token
        }
      } as AuthResponse);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as AuthResponse);
    }
  }

  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password, displayName }: RegisterRequest = req.body;

      if (!username || !email || !password) {
        res.status(400).json({
          success: false,
          message: 'Username, email, and password are required'
        } as AuthResponse);
        return;
      }

      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({
          success: false,
          message: 'Invalid email format'
        } as AuthResponse);
        return;
      }

      // Validasi password minimal 6 karakter
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        } as AuthResponse);
        return;
      }

      // Check if user already exists
      const existingUser = await findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Email already registered. Please use a different email or try logging in.'
        } as AuthResponse);
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create new user dengan role default 'user'
      const createData: any = {
        username: username.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'user' as const,
        isEmailVerified: true, // Auto-verify untuk kemudahan
        displayName: displayName || username.trim()
      };

      const newUser = await User.create(createData);

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
            username: newUser.username,
            email: newUser.email,
            displayName: newUser.displayName,
            role: newUser.role,
            isEmailVerified: newUser.isEmailVerified,
            lastLogin: newUser.lastLogin,
            createdAt: newUser.createdAt
          },
          token
        }
      } as AuthResponse);
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed. Please try again.',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as AuthResponse);
    }
  }

  static async logout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie('token');
      res.json({
        success: true,
        message: 'Logged out successfully'
      } as AuthResponse);
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as AuthResponse);
    }
  }

  static async getMe(req: Request, res: Response): Promise<void> {
    try {
      const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        res.status(401).json({
          success: false,
          message: 'No token provided'
        } as AuthResponse);
        return;
      }

      const decoded = verifyToken(token);
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not found'
        } as AuthResponse);
        return;
      }

      res.json({
        success: true,
        message: 'User retrieved successfully',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            isEmailVerified: user.isEmailVerified,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
          }
        }
      } as AuthResponse);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid token',
        error: error instanceof Error ? error.message : 'Unknown error'
      } as AuthResponse);
    }
  }
}

export default AuthController;

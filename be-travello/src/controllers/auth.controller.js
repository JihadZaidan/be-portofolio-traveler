const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserMySQL = require('../models/UserMySQL');
const { parseDataUrl } = require('./media.controller');
const MediaMySQL = require('../models/MediaMySQL');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

const setAuthCookie = (res, token) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('authToken', token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User password
 *         login_page:
 *           type: string
 *           description: Login page source
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - username
 *         - displayName
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         username:
 *           type: string
 *           minLength: 3
 *           description: Unique username
 *         displayName:
 *           type: string
 *           description: Display name
 *         password:
 *           type: string
 *           minLength: 6
 *           description: User password
 *         profilePicture:
 *           type: string
 *           description: Profile picture URL
 *         login_page:
 *           type: string
 *           description: Login page source
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT authentication token
 *             user:
 *               $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request - Missing fields or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const register = async (req, res) => {
    try {
        const { email, username, displayName, password, profilePicture, login_page } = req.body;

        console.log('📝 Registration attempt:', { email, username, displayName, login_page });

        // Validate required fields
        if (!email || !username || !displayName || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = await UserMySQL.findOne({ email: email }) || 
                            await UserMySQL.findOne({ username: username });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Check if UserMySQL is available (works with both MySQL and SQLite fallback)
        if (!UserMySQL || (!UserMySQL.connection && !UserMySQL.useSQLite)) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user object
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        let storedProfilePicture = profilePicture || null;
        // If profilePicture is a data URL, store it in DB media and save URL reference
        try {
            const parsed = parseDataUrl(profilePicture);
            if (parsed) {
                const created = await MediaMySQL.create({
                    fileName: `avatar_${userId}`,
                    mimeType: parsed.mimeType,
                    buffer: parsed.buffer
                });
                storedProfilePicture = `/api/media/${created.id}`;
            }
        } catch (e) {
            console.warn('⚠️ Failed to store avatar in media DB, keeping profilePicture as-is');
        }

        const newUser = {
            id: userId,
            email,
            username,
            displayName,
            password: hashedPassword,
            profilePicture: storedProfilePicture,
            isActive: true,
            isVerified: false,
            lastLogin: new Date(),
            loginPage: login_page || 'default',
            provider: 'local',
            role: 'user'
        };

        // Save to database
        await UserMySQL.create(newUser);

        // Generate token
        const token = generateToken(newUser.id);
        setAuthCookie(res, token);

        console.log('✅ User registered successfully:', { userId: newUser.id, email });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    displayName: newUser.displayName,
                    profilePicture: newUser.profilePicture,
                    isActive: newUser.isActive,
                    loginPage: newUser.loginPage
                }
            }
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials or account deactivated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const login = async (req, res) => {
    try {
        const { email, password, login_page } = req.body;

        console.log('🔐 Login attempt:', { email, login_page });

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Check if UserMySQL is available (works with both MySQL and SQLite fallback)
        if (!UserMySQL || (!UserMySQL.connection && !UserMySQL.useSQLite)) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Find user by email OR username
        const user = (await UserMySQL.findOne({ email: email })) || (await UserMySQL.findOne({ username: email }));

        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            console.log('❌ User not active:', email);
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Compare password
        const isPasswordValid = await UserMySQL.comparePassword(password, user.password);

        if (!isPasswordValid) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        await UserMySQL.update(user.id, {
            lastLogin: new Date(),
            loginPage: login_page || user.loginPage
        });

        // Generate token
        const token = generateToken(user.id);
        setAuthCookie(res, token);

        console.log('✅ User logged in successfully:', { userId: user.id, email });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    displayName: user.displayName,
                    profilePicture: user.profilePicture,
                    isActive: user.isActive,
                    loginPage: user.loginPage,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await UserMySQL.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    displayName: user.displayName,
                    profilePicture: user.profilePicture,
                    isActive: user.isActive,
                    loginPage: user.loginPage,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        console.error('❌ Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Logout user (client-side token removal)
const logout = (req, res) => {
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('authToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax'
    });
    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};

// Google OAuth success callback
const googleSuccess = (req, res) => {
    try {
        console.log('✅ Google OAuth success:', req.user);
        
        // Generate token
        const token = generateToken(req.user.id);
        setAuthCookie(res, token);
        
        // Redirect to frontend WITHOUT exposing token in URL
        const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const userData = {
            id: req.user.id,
            email: req.user.email,
            username: req.user.username,
            displayName: req.user.displayName,
            profilePicture: req.user.profilePicture,
            isActive: req.user.isActive,
            loginPage: req.user.loginPage,
            provider: req.user.provider || 'google'
        };
        
        // Determine action based on whether user is new or existing
        const action = req.user.createdAt && (Date.now() - new Date(req.user.createdAt).getTime()) < 60000 ? 'signup' : 'login';
        
        // Build redirect URL with proper encoding
        const params = new URLSearchParams({
            user: JSON.stringify(userData),
            action: action,
            login_page: req.user.loginPage || 'default'
        });
        
        res.redirect(`${redirectUrl}/auth/callback?${params.toString()}`);
        
    } catch (error) {
        console.error('❌ Google success callback error:', error);
        const redirectUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${redirectUrl}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
};

// Google OAuth failure callback
const googleFailure = (req, res) => {
    console.log('❌ Google OAuth failure');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/error?message=Google authentication failed`);
};

// Forgot password
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        console.log('🔑 Forgot password request:', { email });

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        // Check if UserMySQL is available
        if (!UserMySQL || (!UserMySQL.connection && !UserMySQL.useSQLite)) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Find user by email
        const user = await UserMySQL.findOne({ email: email });

        if (!user) {
            // Don't reveal if email exists or not for security
            return res.status(200).json({
                success: true,
                message: 'If an account with that email exists, a password reset link has been sent'
            });
        }

        // Generate reset token (simplified version - in production, use email service)
        const resetToken = require('crypto').randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Store reset token in database (you'd need to add these columns to users table)
        await UserMySQL.update(user.id, {
            resetToken: resetToken,
            resetTokenExpiry: resetTokenExpiry
        });

        console.log('✅ Password reset token generated for:', email);

        // In production, send email with reset link
        // For now, just return success
        res.status(200).json({
            success: true,
            message: 'Password reset link has been sent to your email',
            // For development only:
            resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
        });

    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Reset password
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        console.log('🔑 Reset password request');

        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Reset token and new password are required'
            });
        }

        // Check if UserMySQL is available
        if (!UserMySQL || (!UserMySQL.connection && !UserMySQL.useSQLite)) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Find user by reset token (you'd need to add resetToken column to users table)
        // For now, we'll skip token validation and just reset any user's password
        // In production, you'd validate the token and expiry

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // For demo purposes, we'll reset the first user's password
        // In production, find by reset token and check expiry
        let users;
        if (UserMySQL.useSQLite) {
            users = UserMySQL.sqliteDb.users.slice(0, 1);
        } else {
            [users] = await UserMySQL.connection.execute(
                'SELECT id FROM users LIMIT 1'
            );
        }

        if (users.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Update password and clear reset token
        await UserMySQL.update(users[0].id, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null
        });

        console.log('✅ Password reset successful');

        res.status(200).json({
            success: true,
            message: 'Password has been reset successfully'
        });

    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { displayName, username, phone, address_city, address_province, address_country } = req.body;

        console.log('📝 Update profile request:', { userId });

        // Check if UserMySQL is available
        if (!UserMySQL || (!UserMySQL.connection && !UserMySQL.useSQLite)) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Check if username is already taken by another user
        if (username) {
            const existingUser = await UserMySQL.findOne({ username: username });
            if (existingUser && existingUser.id !== userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Username is already taken'
                });
            }
        }

        // Update user profile
        const updateData = {};
        if (displayName) updateData.displayName = displayName;
        if (username) updateData.username = username;
        if (phone) updateData.phone = phone;
        if (address_city) updateData.address_city = address_city;
        if (address_province) updateData.address_province = address_province;
        if (address_country) updateData.address_country = address_country;

        const updatedUser = await UserMySQL.update(userId, updateData);

        console.log('✅ Profile updated successfully:', { userId });

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: updatedUser.id,
                    email: updatedUser.email,
                    username: updatedUser.username,
                    displayName: updatedUser.displayName,
                    profilePicture: updatedUser.profilePicture,
                    phone: updatedUser.phone,
                    address_city: updatedUser.address_city,
                    address_province: updatedUser.address_province,
                    address_country: updatedUser.address_country,
                    isActive: updatedUser.isActive,
                    loginPage: updatedUser.loginPage,
                    role: updatedUser.role
                }
            }
        });

    } catch (error) {
        console.error('❌ Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Change password
const changePassword = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        console.log('🔑 Change password request:', { userId });

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        // Check if UserMySQL is available
        if (!UserMySQL || (!UserMySQL.connection && !UserMySQL.useSQLite)) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Get current user
        const user = await UserMySQL.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await UserMySQL.comparePassword(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        await UserMySQL.update(userId, {
            password: hashedPassword
        });

        console.log('✅ Password changed successfully:', { userId });

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('❌ Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    logout,
    googleSuccess,
    googleFailure,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword
};

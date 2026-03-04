const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// In-memory storage for testing (when MongoDB is not available)
let users = [];

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Register new user
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

        // Check if user already exists in memory
        const existingUser = users.find(user => user.email === email || user.username === username);

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user object
        const newUser = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email,
            username,
            displayName,
            password: hashedPassword,
            profilePicture: profilePicture || null,
            isActive: true,
            lastLogin: new Date(),
            loginPage: login_page || 'default',
            createdAt: new Date()
        };

        // Store in memory
        users.push(newUser);

        // Generate token
        const token = generateToken(newUser.id);

        console.log('✅ User registered successfully:', { userId: newUser.id, email });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                token,
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

// Login user
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

        // Find user by email in memory
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated'
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        if (login_page) {
            user.loginPage = login_page;
        }

        // Generate token
        const token = generateToken(user.id);

        console.log('✅ User logged in successfully:', { userId: user.id, email });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    displayName: user.displayName,
                    profilePicture: user.profilePicture,
                    isActive: user.isActive,
                    loginPage: user.loginPage
                }
            }
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = users.find(u => u.id === userId);

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
    res.status(200).json({
        success: true,
        message: 'Logout successful'
    });
};

module.exports = {
    register,
    login,
    getProfile,
    logout
};

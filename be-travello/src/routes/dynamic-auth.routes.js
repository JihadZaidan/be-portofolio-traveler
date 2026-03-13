const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserMySQL = require('../models/UserMySQL');

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Dynamic login with multiple authentication methods
const dynamicLogin = async (req, res) => {
    try {
        const { email, password, username, loginMethod = 'email' } = req.body;

        console.log('🔐 Dynamic login attempt:', { email, username, loginMethod });

        // Validate required fields
        if (loginMethod === 'email' && !email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required for email login'
            });
        }

        if (loginMethod === 'username' && !username) {
            return res.status(400).json({
                success: false,
                message: 'Username is required for username login'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        // Check if UserMySQL is available
        if (!UserMySQL || !UserMySQL.connection) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Find user by email or username
        let user;
        if (loginMethod === 'email') {
            user = await UserMySQL.findOne({ email: email });
        } else if (loginMethod === 'username') {
            user = await UserMySQL.findOne({ username: username });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid login method'
            });
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
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
        const isPasswordValid = await UserMySQL.comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await UserMySQL.update(user.id, {
            lastLogin: new Date()
        });

        // Generate token
        const token = generateToken(user.id);

        console.log('✅ Dynamic login successful:', { userId: user.id, loginMethod });

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
                    loginPage: user.loginPage,
                    role: user.role,
                    phone: user.phone,
                    address_city: user.address_city,
                    address_country: user.address_country
                },
                loginMethod
            }
        });

    } catch (error) {
        console.error('❌ Dynamic login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Dynamic registration with role assignment
const dynamicRegister = async (req, res) => {
    try {
        const { 
            email, 
            username, 
            displayName, 
            password, 
            confirmPassword,
            phone,
            address_city,
            address_country,
            role = 'user', // Default role, can be overridden
            inviteCode // For admin registration
        } = req.body;

        console.log('📝 Dynamic registration attempt:', { email, username, role });

        // Validate required fields
        if (!email || !username || !displayName || !password) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be filled'
            });
        }

        // Password confirmation
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Password strength validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Role validation
        if (role === 'admin' && inviteCode !== 'TRAVELLO_ADMIN_2024') {
            return res.status(403).json({
                success: false,
                message: 'Invalid admin invite code'
            });
        }

        // Check if UserMySQL is available
        if (!UserMySQL || !UserMySQL.connection) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
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

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user object
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = {
            id: userId,
            email,
            username,
            displayName,
            password: hashedPassword,
            phone: phone || null,
            address_city: address_city || null,
            address_country: address_country || 'Indonesia',
            isActive: true,
            isVerified: false,
            lastLogin: new Date(),
            loginPage: 'default',
            provider: 'local',
            role: role
        };

        // Save to database
        await UserMySQL.create(newUser);

        // Generate token
        const token = generateToken(newUser.id);

        console.log('✅ Dynamic registration successful:', { userId: newUser.id, email, role });

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
                    loginPage: newUser.loginPage,
                    role: newUser.role,
                    phone: newUser.phone,
                    address_city: newUser.address_city,
                    address_country: newUser.address_country
                }
            }
        });

    } catch (error) {
        console.error('❌ Dynamic registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Quick login for testing (auto-login any user)
const quickLogin = async (req, res) => {
    try {
        const { userType = 'user' } = req.body;

        console.log('⚡ Quick login attempt:', { userType });

        // Check if UserMySQL is available
        if (!UserMySQL || !UserMySQL.connection) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        // Get first available user of specified type
        const [users] = await UserMySQL.connection.execute(
            'SELECT * FROM users WHERE role = ? AND isActive = 1 LIMIT 1',
            [userType]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No active ${userType} found`
            });
        }

        const user = users[0];

        // Update last login
        await UserMySQL.update(user.id, {
            lastLogin: new Date()
        });

        // Generate token
        const token = generateToken(user.id);

        console.log('✅ Quick login successful:', { userId: user.id, userType });

        res.status(200).json({
            success: true,
            message: 'Quick login successful',
            data: {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    displayName: user.displayName,
                    profilePicture: user.profilePicture,
                    isActive: user.isActive,
                    loginPage: user.loginPage,
                    role: user.role,
                    phone: user.phone,
                    address_city: user.address_city,
                    address_country: user.address_country
                },
                loginMethod: 'quick'
            }
        });

    } catch (error) {
        console.error('❌ Quick login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during quick login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all available users (for testing)
const getAllUsers = async (req, res) => {
    try {
        console.log('📋 Getting all users...');

        // Check if UserMySQL is available
        if (!UserMySQL || !UserMySQL.connection) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
            });
        }

        const users = await UserMySQL.findMany({ isActive: true });

        console.log(`✅ Found ${users.length} active users`);

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: {
                users: users.map(user => ({
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    displayName: user.displayName,
                    role: user.role,
                    isActive: user.isActive,
                    phone: user.phone,
                    address_city: user.address_city,
                    address_country: user.address_country,
                    createdAt: user.createdAt
                })),
                total: users.length
            }
        });

    } catch (error) {
        console.error('❌ Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create user with custom data
const createUser = async (req, res) => {
    try {
        const { 
            email, 
            username, 
            displayName, 
            password = 'password123',
            role = 'user',
            phone,
            address_city,
            address_country
        } = req.body;

        console.log('👤 Creating user:', { email, username, role });

        // Validate required fields
        if (!email || !username || !displayName) {
            return res.status(400).json({
                success: false,
                message: 'Email, username, and displayName are required'
            });
        }

        // Check if UserMySQL is available
        if (!UserMySQL || !UserMySQL.connection) {
            console.error('❌ UserMySQL model not initialized');
            return res.status(500).json({
                success: false,
                message: 'Database connection not available'
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

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user object
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = {
            id: userId,
            email,
            username,
            displayName,
            password: hashedPassword,
            phone: phone || null,
            address_city: address_city || null,
            address_country: address_country || 'Indonesia',
            isActive: true,
            isVerified: true,
            lastLogin: new Date(),
            loginPage: 'default',
            provider: 'local',
            role: role
        };

        // Save to database
        await UserMySQL.create(newUser);

        console.log('✅ User created successfully:', { userId: newUser.id, email, role });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    username: newUser.username,
                    displayName: newUser.displayName,
                    role: newUser.role,
                    password: password, // Return plain password for testing
                    phone: newUser.phone,
                    address_city: newUser.address_city,
                    address_country: newUser.address_country
                }
            }
        });

    } catch (error) {
        console.error('❌ Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during user creation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Routes
router.post('/dynamic-login', dynamicLogin);
router.post('/dynamic-register', dynamicRegister);
router.post('/quick-login', quickLogin);
router.get('/users', getAllUsers);
router.post('/create-user', createUser);

module.exports = router;

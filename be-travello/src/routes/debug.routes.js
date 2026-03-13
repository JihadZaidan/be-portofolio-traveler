const express = require('express');
const router = express.Router();
const UserMySQL = require('../models/UserMySQL');

// Debug endpoint to check database status
router.get('/debug-db', async (req, res) => {
    try {
        console.log('🔍 Debug: Checking database status...');
        
        // Check UserMySQL model status
        const userModelStatus = {
            hasConnection: !!UserMySQL.connection,
            useSQLite: UserMySQL.useSQLite,
            hasSQLiteDb: !!UserMySQL.sqliteDb
        };
        
        console.log('📊 UserMySQL Status:', userModelStatus);
        
        // Try to find all users
        let users = [];
        try {
            users = await UserMySQL.findMany();
            console.log(`👥 Found ${users.length} users in database`);
        } catch (error) {
            console.error('❌ Error finding users:', error);
        }
        
        // Try to find a specific user
        let testUser = null;
        try {
            testUser = await UserMySQL.findOne({ email: 'test@example.com' });
            console.log('🧪 Test user lookup:', testUser ? 'Found' : 'Not found');
        } catch (error) {
            console.error('❌ Error finding test user:', error);
        }
        
        // Test password comparison if user exists
        let passwordTest = null;
        if (testUser && testUser.password) {
            try {
                const isMatch = await UserMySQL.comparePassword('test123', testUser.password);
                passwordTest = {
                    userExists: true,
                    hasPassword: !!testUser.password,
                    passwordMatch: isMatch,
                    passwordHash: testUser.password.substring(0, 20) + '...'
                };
            } catch (error) {
                passwordTest = {
                    userExists: true,
                    error: error.message
                };
            }
        } else {
            passwordTest = {
                userExists: false,
                message: 'Test user not found or no password'
            };
        }
        
        res.json({
            success: true,
            data: {
                userModelStatus,
                totalUsers: users.length,
                users: users.map(u => ({
                    id: u.id,
                    email: u.email,
                    username: u.username,
                    isActive: u.isActive,
                    hasPassword: !!u.password,
                    provider: u.provider
                })),
                testUser: testUser ? {
                    id: testUser.id,
                    email: testUser.email,
                    username: testUser.username,
                    isActive: testUser.isActive,
                    hasPassword: !!testUser.password,
                    provider: testUser.provider
                } : null,
                passwordTest
            }
        });
        
    } catch (error) {
        console.error('❌ Debug endpoint error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Test user creation endpoint
router.post('/debug-create-user', async (req, res) => {
    try {
        const { email, username, displayName, password } = req.body;
        
        console.log('🔧 Debug: Creating test user...', { email, username });
        
        // Check if user already exists
        const existingUser = await UserMySQL.findOne({ email }) || 
                            await UserMySQL.findOne({ username });
        
        if (existingUser) {
            return res.json({
                success: false,
                message: 'User already exists',
                existingUser: {
                    id: existingUser.id,
                    email: existingUser.email,
                    username: existingUser.username
                }
            });
        }
        
        // Create new user
        const userId = `debug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newUser = {
            id: userId,
            email,
            username,
            displayName,
            password: await UserMySQL.hashPassword(password),
            isActive: true,
            isVerified: false,
            role: 'user',
            provider: 'local'
        };
        
        await UserMySQL.create(newUser);
        
        console.log('✅ Debug user created successfully:', { userId, email });
        
        res.json({
            success: true,
            message: 'Debug user created successfully',
            user: {
                id: newUser.id,
                email: newUser.email,
                username: newUser.username,
                displayName: newUser.displayName
            }
        });
        
    } catch (error) {
        console.error('❌ Debug create user error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;

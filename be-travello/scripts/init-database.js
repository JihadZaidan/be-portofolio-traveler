const mysql = require('mysql2/promise');

async function initializeDatabase() {
    try {
        console.log('🔧 Initializing MySQL database...');
        
        // Connect to MySQL without specifying database first
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || ''
        });
        
        console.log('✅ Connected to MySQL server');
        
        // Create database if not exists
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${process.env.MYSQL_DATABASE || 'travello_db'}\``);
        console.log(`✅ Database '${process.env.MYSQL_DATABASE || 'travello_db'}' created/verified`);
        
        // Switch to the database
        await connection.query(`USE \`${process.env.MYSQL_DATABASE || 'travello_db'}\``);
        
        // Create users table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                googleId VARCHAR(255),
                email VARCHAR(255) UNIQUE NOT NULL,
                username VARCHAR(255) UNIQUE NOT NULL,
                displayName VARCHAR(255),
                password VARCHAR(255),
                profilePicture TEXT,
                avatar TEXT,
                provider ENUM('local', 'google', 'facebook') DEFAULT 'local',
                loginPage VARCHAR(50) DEFAULT 'default',
                phone VARCHAR(20),
                dateOfBirth DATE,
                gender ENUM('male', 'female', 'other') DEFAULT 'other',
                address_street TEXT,
                address_city VARCHAR(100),
                address_province VARCHAR(100),
                address_postalCode VARCHAR(10),
                address_country VARCHAR(100) DEFAULT 'Indonesia',
                travelPreferences_favoriteDestinations JSON,
                travelPreferences_travelStyle VARCHAR(50) DEFAULT 'budget',
                travelPreferences_interests JSON,
                isVerified BOOLEAN DEFAULT false,
                isActive BOOLEAN DEFAULT true,
                lastLogin TIMESTAMP NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                totalTransactions INT DEFAULT 0,
                totalSpent DECIMAL(10,2) DEFAULT 0.00,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Users table created/verified');
        
        // Check if admin user exists, create if not
        const [adminCheck] = await connection.execute(
            'SELECT * FROM users WHERE email = ?',
            ['admin@travello.com']
        );
        
        if (adminCheck.length === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            await connection.execute(`
                INSERT INTO users (
                    id, email, username, displayName, password, 
                    provider, role, isActive, isVerified, lastLogin
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `, [
                `admin_${Date.now()}`,
                'admin@travello.com',
                'admin',
                'Administrator',
                hashedPassword,
                'local',
                'admin',
                true,
                true
            ]);
            
            console.log('✅ Default admin user created (admin@travello.com / admin123)');
        } else {
            console.log('✅ Admin user already exists');
        }
        
        await connection.end();
        console.log('🎉 Database initialization completed successfully');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

// Load environment variables
require('dotenv').config();

// Run initialization
initializeDatabase();

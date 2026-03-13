const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function createSampleUsers() {
    try {
        console.log('👥 Creating sample users...');
        
        // Connect to database
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'travello_db'
        });
        
        console.log('✅ Connected to database');
        
        // Sample users data
        const sampleUsers = [
            {
                email: 'user@travello.com',
                username: 'user',
                displayName: 'Regular User',
                password: 'user123',
                role: 'user',
                phone: '08123456789',
                address_city: 'Jakarta',
                address_country: 'Indonesia'
            },
            {
                email: 'john@travello.com',
                username: 'john',
                displayName: 'John Traveler',
                password: 'john123',
                role: 'user',
                phone: '08234567890',
                address_city: 'Bali',
                address_country: 'Indonesia'
            },
            {
                email: 'sarah@travello.com',
                username: 'sarah',
                displayName: 'Sarah Explorer',
                password: 'sarah123',
                role: 'user',
                phone: '08345678901',
                address_city: 'Yogyakarta',
                address_country: 'Indonesia'
            },
            {
                email: 'admin@travello.com',
                username: 'admin',
                displayName: 'Administrator',
                password: 'admin123',
                role: 'admin',
                phone: '08111111111',
                address_city: 'Jakarta',
                address_country: 'Indonesia'
            },
            {
                email: 'manager@travello.com',
                username: 'manager',
                displayName: 'Manager',
                password: 'manager123',
                role: 'admin',
                phone: '08222222222',
                address_city: 'Surabaya',
                address_country: 'Indonesia'
            }
        ];
        
        for (const user of sampleUsers) {
            // Check if user already exists
            const [existing] = await connection.execute(
                'SELECT id FROM users WHERE email = ? OR username = ?',
                [user.email, user.username]
            );
            
            if (existing.length === 0) {
                // Hash password
                const hashedPassword = await bcrypt.hash(user.password, 12);
                
                // Generate unique ID
                const userId = `${user.role}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                
                // Insert user
                await connection.execute(`
                    INSERT INTO users (
                        id, email, username, displayName, password,
                        provider, role, isActive, isVerified, phone,
                        address_city, address_country, lastLogin, createdAt, updatedAt
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())
                `, [
                    userId,
                    user.email,
                    user.username,
                    user.displayName,
                    hashedPassword,
                    'local',
                    user.role,
                    true,
                    true,
                    user.phone,
                    user.address_city,
                    user.address_country
                ]);
                
                console.log(`✅ Created user: ${user.email} (${user.password})`);
            } else {
                console.log(`ℹ️  User already exists: ${user.email}`);
            }
        }
        
        // Display all users
        const [allUsers] = await connection.execute(
            'SELECT email, username, displayName, role, isActive FROM users ORDER BY createdAt DESC'
        );
        
        console.log('\n📋 All users in database:');
        console.log('Email\t\t\tUsername\tDisplay Name\t\tRole\tStatus');
        console.log('─'.repeat(80));
        
        allUsers.forEach(user => {
            const status = user.isActive ? 'Active' : 'Inactive';
            console.log(`${user.email}\t${user.username}\t\t${user.displayName}\t\t${user.role}\t${status}`);
        });
        
        await connection.end();
        console.log('\n🎉 Sample users creation completed!');
        console.log('\n🔑 Login credentials:');
        console.log('Regular users: user@travello.com / user123');
        console.log('                john@travello.com / john123');
        console.log('                sarah@travello.com / sarah123');
        console.log('Admin users:   admin@travello.com / admin123');
        console.log('                manager@travello.com / manager123');
        
    } catch (error) {
        console.error('❌ Error creating sample users:', error);
        process.exit(1);
    }
}

// Load environment variables
require('dotenv').config();

// Run script
createSampleUsers();

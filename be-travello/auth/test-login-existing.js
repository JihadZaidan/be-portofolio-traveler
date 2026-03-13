const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testLogin() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: 'travello_db'
        });
        
        // Test existing users
        const testUsers = [
            { email: 'kenova@gmail.com', password: 'password123' },
            { email: 'boronminister@conservative.gov', password: 'password123' },
            { email: 'user@travello.com', password: 'user123' },
            { email: 'admin@travello.com', password: 'admin123' }
        ];
        
        console.log('🔐 Testing login for existing users...');
        
        for (const testUser of testUsers) {
            const [users] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [testUser.email]
            );
            
            if (users.length > 0) {
                const user = users[0];
                console.log(`\n📧 Testing: ${testUser.email}`);
                console.log(`👤 User found: ${user.displayName} (${user.role})`);
                console.log(`🔑 Has password: ${user.password ? 'Yes' : 'No'}`);
                
                if (user.password) {
                    try {
                        const isValid = await bcrypt.compare(testUser.password, user.password);
                        console.log(`✅ Password valid: ${isValid}`);
                    } catch (error) {
                        console.log(`❌ Password check failed: ${error.message}`);
                    }
                } else {
                    console.log('❌ No password set (OAuth user?)');
                }
            } else {
                console.log(`❌ User not found: ${testUser.email}`);
            }
        }
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testLogin();

const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function resetOldUserPasswords() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: 'travello_db'
        });
        
        console.log('🔧 Resetting passwords for existing users...');
        
        // Get users without proper password hash
        const [users] = await connection.execute(
            'SELECT id, email, username, displayName FROM users WHERE email IN (?, ?)',
            ['kenova@gmail.com', 'boronminister@conservative.gov']
        );
        
        for (const user of users) {
            // Set default password
            const defaultPassword = 'password123';
            const hashedPassword = await bcrypt.hash(defaultPassword, 12);
            
            await connection.execute(
                'UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?',
                [hashedPassword, user.id]
            );
            
            console.log(`✅ Password reset for ${user.email}: ${defaultPassword}`);
        }
        
        // Test the reset passwords
        console.log('\n🔐 Testing reset passwords...');
        
        for (const user of users) {
            const [testUsers] = await connection.execute(
                'SELECT password FROM users WHERE email = ?',
                [user.email]
            );
            
            if (testUsers.length > 0) {
                const isValid = await bcrypt.compare('password123', testUsers[0].password);
                console.log(`${user.email}: ✅ Password valid: ${isValid}`);
            }
        }
        
        await connection.end();
        console.log('\n🎉 Password reset completed!');
        console.log('📋 Updated login credentials:');
        console.log('kenova@gmail.com / password123');
        console.log('boronminister@conservative.gov / password123');
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

resetOldUserPasswords();

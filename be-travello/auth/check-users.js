const mysql = require('mysql2/promise');

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: '',
            database: 'travello_db'
        });
        
        const [users] = await connection.execute('SELECT email, username, displayName, role, isActive FROM users ORDER BY createdAt DESC');
        console.log('📋 All users in database:');
        console.log('Email\t\t\tUsername\tDisplay Name\t\tRole\tStatus');
        console.log('─'.repeat(80));
        
        users.forEach(user => {
            const status = user.isActive ? 'Active' : 'Inactive';
            console.log(`${user.email}\t${user.username}\t\t${user.displayName}\t\t${user.role}\t${status}`);
        });
        
        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkUsers();

const mysql = require('mysql2/promise');

async function addResetTokenColumns() {
    try {
        console.log('🔧 Adding reset token columns to database...');
        
        // Connect to database
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST || 'localhost',
            port: process.env.MYSQL_PORT || 3306,
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || '',
            database: process.env.MYSQL_DATABASE || 'travello_db'
        });
        
        console.log('✅ Connected to database');
        
        // Add resetToken column
        try {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN resetToken VARCHAR(255) NULL
            `);
            console.log('✅ Added resetToken column');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  resetToken column already exists');
            } else {
                throw error;
            }
        }
        
        // Add resetTokenExpiry column
        try {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN resetTokenExpiry TIMESTAMP NULL
            `);
            console.log('✅ Added resetTokenExpiry column');
        } catch (error) {
            if (error.code === 'ER_DUP_FIELDNAME') {
                console.log('ℹ️  resetTokenExpiry column already exists');
            } else {
                throw error;
            }
        }
        
        await connection.end();
        console.log('🎉 Database schema updated successfully!');
        
    } catch (error) {
        console.error('❌ Error updating database schema:', error);
        process.exit(1);
    }
}

// Load environment variables
require('dotenv').config();

// Run script
addResetTokenColumns();

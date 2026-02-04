const { Sequelize } = require('sequelize');
const path = require('path');

// MySQL configuration for phpMyAdmin
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'travello_db',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    dialect: 'mysql',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection to phpMyAdmin established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL/phpMyAdmin:', error);
    console.log('💡 Make sure XAMPP/WAMP is running and MySQL service is started');
    console.log('💡 phpMyAdmin should be accessible at: http://localhost/phpmyadmin');
    throw error;
  }
};

// Initialize database and create users table
const initializeDatabase = async () => {
  try {
    // Create users table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        display_name VARCHAR(255),
        role ENUM('user', 'admin') DEFAULT 'user',
        is_email_verified BOOLEAN DEFAULT FALSE,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    console.log('✅ users table created/verified in phpMyAdmin');
    console.log('✅ Database synchronized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    throw error;
  }
};

module.exports = { sequelize, testConnection, initializeDatabase };
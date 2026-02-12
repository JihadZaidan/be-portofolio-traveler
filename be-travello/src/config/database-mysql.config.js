const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Always use MySQL for development and production
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'travello_shop',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
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
    console.log('✅ MySQL database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error);
    return false;
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log(`✅ MySQL database synchronized successfully.`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to synchronize MySQL database:`, error);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  initializeDatabase
};

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Use SQLite for local development (easier to test without MySQL installation)
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.MYSQL_HOST;

const sequelize = isDevelopment ? 
  // SQLite configuration for development
  new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../database/travello_dev.sqlite'),
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }) :
  // MySQL configuration for production
  new Sequelize(
    process.env.MYSQL_DATABASE || 'travello_db',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      dialect: 'mysql',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
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
    console.log(`✅ ${isDevelopment ? 'SQLite' : 'MySQL'} connection has been established successfully.`);
    return true;
  } catch (error) {
    console.error(`❌ Unable to connect to ${isDevelopment ? 'SQLite' : 'MySQL'} database:`, error);
    return false;
  }
};

// Initialize database
const initializeDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log(`✅ ${isDevelopment ? 'SQLite' : 'MySQL'} database synchronized successfully.`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to synchronize ${isDevelopment ? 'SQLite' : 'MySQL'} database:`, error);
    return false;
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.initializeDatabase = initializeDatabase;

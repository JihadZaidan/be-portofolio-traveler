const { Sequelize } = require('sequelize');

// MySQL configuration for travello_shop database
const sequelize = new Sequelize(
  'travello_shop',
  'root',
  '',
  {
    host: '127.0.0.1',
    port: 3306,
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
    console.error('💡 Make sure MySQL is running and database travello_shop exists');
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

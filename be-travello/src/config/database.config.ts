import { Sequelize } from 'sequelize';

// MySQL configuration
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'travello_db',
  process.env.MYSQL_USER || 'root',
  process.env.MYSQL_PASSWORD || '',
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
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
const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to MySQL database:', error);
    throw error;
  }
};

// Initialize database
const initializeDatabase = async (): Promise<void> => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ MySQL database synchronized successfully');
  } catch (error) {
    console.error('❌ Failed to synchronize MySQL database:', error);
    throw error;
  }
};

export { sequelize, testConnection, initializeDatabase };

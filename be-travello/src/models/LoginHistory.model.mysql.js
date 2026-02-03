const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-mysql.config.js');

const LoginHistory = sequelize.define('LoginHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  loginTime: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'login_time'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  },
  loginMethod: {
    type: DataTypes.ENUM('local', 'google', 'github'),
    allowNull: false,
    defaultValue: 'local',
    field: 'login_method'
  }
}, {
  tableName: 'login_history',
  timestamps: true,
  createdAt: 'login_time',
  updatedAt: false
});

// Initialize model
const initLoginHistory = async () => {
  try {
    await LoginHistory.sync({ alter: true });
    console.log('✅ LoginHistory model initialized');
  } catch (error) {
    console.error('❌ Failed to initialize LoginHistory model:', error);
    throw error;
  }
};

// Get login history for user
const getUserLoginHistory = async (userId, limit = 10) => {
  try {
    const history = await LoginHistory.findAll({
      where: { userId },
      order: [['login_time', 'DESC']],
      limit
    });
    return history;
  } catch (error) {
    console.error('❌ Error getting user login history:', error);
    throw error;
  }
};

// Get all login history (admin)
const getAllLoginHistory = async (limit = 50) => {
  try {
    const history = await LoginHistory.findAll({
      order: [['login_time', 'DESC']],
      limit,
      include: [{
        model: require('./User.model.mysql.js').User,
        attributes: ['id', 'username', 'email', 'displayName']
      }]
    });
    return history;
  } catch (error) {
    console.error('❌ Error getting all login history:', error);
    throw error;
  }
};

module.exports = {
  LoginHistory,
  initLoginHistory,
  getUserLoginHistory,
  getAllLoginHistory
};

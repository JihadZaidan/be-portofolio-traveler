const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-mysql.config.js');

const ShopLoginHistory = sequelize.define('ShopLoginHistory', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `shop_login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'user_id'
  },
  loginMethod: {
    type: DataTypes.ENUM('manual', 'google', 'github'),
    allowNull: false,
    defaultValue: 'manual',
    field: 'login_method'
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
  loginPage: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'shop',
    field: 'login_page'
  },
  success: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'error_message'
  }
}, {
  tableName: 'shop_login_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Initialize Shop Login History model
const initShopLoginHistory = async () => {
  try {
    await ShopLoginHistory.sync({ alter: true });
    console.log('✅ Shop Login History table synchronized successfully');
  } catch (error) {
    console.error('❌ Failed to synchronize Shop Login History table:', error);
    throw error;
  }
};

module.exports = {
  ShopLoginHistory,
  initShopLoginHistory
};

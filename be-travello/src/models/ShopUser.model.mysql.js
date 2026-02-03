const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-mysql.config.js');

const ShopUser = sequelize.define('ShopUser', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `shop_user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'google_id'
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'display_name'
  },
  profilePicture: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'profile_picture'
  },
  provider: {
    type: DataTypes.ENUM('manual', 'google', 'github'),
    allowNull: false,
    defaultValue: 'manual'
  },
  role: {
    type: DataTypes.ENUM('customer', 'shop_admin', 'admin'),
    allowNull: false,
    defaultValue: 'customer'
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_email_verified'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'phone_number'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  preferences: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'shop_users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Initialize Shop User model
const initShopUser = async () => {
  try {
    await ShopUser.sync({ alter: true });
    console.log('✅ Shop User table synchronized successfully');
  } catch (error) {
    console.error('❌ Failed to synchronize Shop User table:', error);
    throw error;
  }
};

// Find shop user by email
const findShopUserByEmail = async (email) => {
  try {
    const user = await ShopUser.findOne({ where: { email } });
    return user;
  } catch (error) {
    console.error('❌ Error finding shop user by email:', error);
    throw error;
  }
};

// Find shop user by Google ID
const findShopUserByGoogleId = async (googleId) => {
  try {
    const user = await ShopUser.findOne({ where: { google_id: googleId } });
    return user;
  } catch (error) {
    console.error('❌ Error finding shop user by Google ID:', error);
    throw error;
  }
};

// Create new shop user
const createShopUser = async (userData) => {
  try {
    const user = await ShopUser.create(userData);
    return user;
  } catch (error) {
    console.error('❌ Error creating shop user:', error);
    throw error;
  }
};

// Update shop user
const updateShopUser = async (id, updateData) => {
  try {
    const [updatedRowsCount] = await ShopUser.update(updateData, { 
      where: { id },
      returning: true
    });
    
    if (updatedRowsCount > 0) {
      return await ShopUser.findByPk(id);
    }
    return null;
  } catch (error) {
    console.error('❌ Error updating shop user:', error);
    throw error;
  }
};

// Delete shop user
const deleteShopUser = async (id) => {
  try {
    const deletedRowsCount = await ShopUser.destroy({ where: { id } });
    return deletedRowsCount > 0;
  } catch (error) {
    console.error('❌ Error deleting shop user:', error);
    throw error;
  }
};

// Get all shop users
const getAllShopUsers = async () => {
  try {
    const users = await ShopUser.findAll({
      order: [['created_at', 'DESC']]
    });
    return users;
  } catch (error) {
    console.error('❌ Error getting all shop users:', error);
    throw error;
  }
};

// Get shop user by ID
const getShopUserById = async (id) => {
  try {
    const user = await ShopUser.findByPk(id);
    return user;
  } catch (error) {
    console.error('❌ Error getting shop user by ID:', error);
    throw error;
  }
};

// Record shop login history
const recordShopLoginHistory = async (userId, loginData) => {
  try {
    const { ShopLoginHistory } = require('./ShopLoginHistory.model.mysql.js');
    await ShopLoginHistory.create({
      userId,
      loginMethod: loginData.method || 'manual',
      ipAddress: loginData.ipAddress,
      userAgent: loginData.userAgent,
      loginPage: 'shop'
    });
  } catch (error) {
    console.error('❌ Error recording shop login history:', error);
    // Don't throw error to avoid breaking login flow
  }
};

module.exports = {
  ShopUser,
  initShopUser,
  findShopUserByEmail,
  findShopUserByGoogleId,
  createShopUser,
  updateShopUser,
  deleteShopUser,
  getAllShopUsers,
  getShopUserById,
  recordShopLoginHistory
};

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-mysql.config.js');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
    defaultValue: 'user'
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_email_verified'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Initialize database connection
const initUser = async () => {
  try {
    await sequelize.authenticate();
    await User.sync({ alter: true });
    console.log('✅ User model initialized with MySQL');
  } catch (error) {
    console.error('❌ Failed to initialize User model:', error);
    throw error;
  }
};

// Find user by email
const findByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    return user;
  } catch (error) {
    console.error('❌ Error finding user by email:', error);
    throw error;
  }
};

// Find user by Google ID
const findByGoogleId = async (googleId) => {
  try {
    const user = await User.findOne({ where: { google_id: googleId } });
    return user;
  } catch (error) {
    console.error('❌ Error finding user by Google ID:', error);
    throw error;
  }
};

// Create new user
const create = async (userData) => {
  try {
    const user = await User.create(userData);
    return user;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
};

// Update user
const updateUser = async (id, updateData) => {
  try {
    const [updatedRowsCount] = await User.update(updateData, { 
      where: { id },
      returning: true
    });
    
    if (updatedRowsCount > 0) {
      return await User.findByPk(id);
    }
    return null;
  } catch (error) {
    console.error('❌ Error updating user:', error);
    throw error;
  }
};

// Delete user
const deleteUser = async (id) => {
  try {
    const deletedRowsCount = await User.destroy({ where: { id } });
    return deletedRowsCount > 0;
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
};

// Get all users
const getAllUsers = async () => {
  try {
    const users = await User.findAll({
      order: [['created_at', 'DESC']]
    });
    return users;
  } catch (error) {
    console.error('❌ Error getting all users:', error);
    throw error;
  }
};

// Get user by ID
const getUserById = async (id) => {
  try {
    const user = await User.findByPk(id);
    return user;
  } catch (error) {
    console.error('❌ Error getting user by ID:', error);
    throw error;
  }
};

// Login history tracking
const recordLoginHistory = async (userId, loginData) => {
  try {
    const { LoginHistory } = require('./LoginHistory.model.mysql.js');
    await LoginHistory.create({
      userId,
      loginMethod: loginData.method || 'manual',
      ipAddress: loginData.ipAddress,
      userAgent: loginData.userAgent
    });
  } catch (error) {
    console.error('❌ Error recording login history:', error);
    // Don't throw error to avoid breaking login flow
  }
};

module.exports = {
  User,
  initUser,
  findByEmail,
  findByGoogleId,
  create,
  updateUser,
  deleteUser,
  getAllUsers,
  getUserById,
  recordLoginHistory
};

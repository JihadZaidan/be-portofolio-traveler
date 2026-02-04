const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database.config.js');
const { v4: uuidv4 } = require('uuid');

class User extends Model {
  toJSON() {
    const values = Object.assign({}, this.get());
    return values;
  }
}

// User model connected to users table in phpMyAdmin
User.init(
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: () => uuidv4()
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    displayName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'display_name'
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
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users', // Connected to users table in phpMyAdmin
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Static methods for users table operations
const findByEmail = async (email) => {
  return await User.findOne({ where: { email: email.toLowerCase() } });
};

const create = async (userData) => {
  return await User.create(userData);
};

const initUser = async () => {
  try {
    await User.sync({ force: false });
    console.log('✅ User model connected to users table in phpMyAdmin');
  } catch (error) {
    console.error('❌ Failed to connect User model to users table:', error);
    throw error;
  }
};

module.exports = { 
  User, 
  findByEmail, 
  create, 
  initUser 
};
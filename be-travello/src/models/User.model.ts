import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.config.js';

interface UserAttributes {
  id: string;
  username: string;
  email: string;
  password?: string;
  googleId?: string;
  githubId?: string;
  displayName?: string;
  profilePicture?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public username!: string;
  public email!: string;
  public password?: string;
  public googleId?: string;
  public githubId?: string;
  public displayName?: string;
  public profilePicture?: string;
  public role!: 'user' | 'admin';
  public isEmailVerified!: boolean;
  public lastLogin?: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: () => require('uuid').v4()
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
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    githubId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    displayName: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    profilePicture: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      defaultValue: 'user'
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
);

// Static methods
const findByGoogleId = async (googleId: string): Promise<User | null> => {
  return await User.findOne({ where: { googleId } });
};

const findByGitHubId = async (githubId: string): Promise<User | null> => {
  return await User.findOne({ where: { githubId } });
};

const findByEmail = async (email: string): Promise<User | null> => {
  return await User.findOne({ where: { email: email.toLowerCase() } });
};

const create = async (userData: UserCreationAttributes): Promise<User> => {
  return await User.create(userData);
};

const initUser = async (): Promise<void> => {
  try {
    await User.sync({ alter: true });
    console.log('✅ User table initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize User table:', error);
    throw error;
  }
};

export { User, UserAttributes, findByGoogleId, findByGitHubId, findByEmail, create, initUser };

const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// Initialize SQLite database for testing
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database/test_auth.sqlite',
  logging: console.log
});

// Define User model
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
  displayName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'display_name'
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

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5000", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    await User.sync({ alter: true });
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
  }
};

// Helper functions
const findByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    return user;
  } catch (error) {
    console.error('❌ Error finding user by email:', error);
    throw error;
  }
};

const create = async (userData) => {
  try {
    const user = await User.create(userData);
    return user;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
};

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

// Routes

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Manual registration endpoint
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, displayName } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
  }

  // Basic email validation
  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please include @ in email'
    });
  }

  try {
    // Check if user already exists
    const existingUser = await findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const userData = {
      username: username || email.split('@')[0],
      email: email,
      displayName: displayName || username || email.split('@')[0],
      provider: 'manual',
      role: 'user',
      isEmailVerified: true,
      lastLogin: new Date()
    };
    
    const user = await create(userData);
    console.log('✅ New user registered:', user.toJSON());
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! You are now logged in.',
      data: {
        user: user.toJSON(),
        token: `manual_signup_token_${user.id}_${Date.now()}`,
        userType: 'regular'
      }
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Get all users (admin endpoint)
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await getAllUsers();
    
    res.json({
      success: true,
      message: 'All users retrieved successfully',
      data: {
        users: users.map(user => ({
          ...user.toJSON(),
          userType: 'regular',
          source: 'Main System'
        })),
        count: users.length
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// Start server
const startServer = async () => {
  await initDatabase();
  
  const PORT = process.env.PORT || 5002;
  app.listen(PORT, () => {
    console.log(`🚀 Test Auth Server running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/admin/users`);
    console.log(`🔐 Register API: http://localhost:${PORT}/api/auth/register`);
  });
};

startServer().catch(console.error);

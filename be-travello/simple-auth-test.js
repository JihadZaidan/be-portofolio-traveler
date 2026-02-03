const express = require('express');
const cors = require('cors');

// Simple in-memory user storage for testing
let users = [];
let userIdCounter = 1;

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5000", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper functions
const findByEmail = (email) => {
  return users.find(user => user.email === email);
};

const create = (userData) => {
  const newUser = {
    id: `user_${userIdCounter++}_${Date.now()}`,
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  users.push(newUser);
  return newUser;
};

const getAllUsers = () => {
  return users.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Routes

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Manual registration endpoint
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, displayName } = req.body;
  
  console.log('📝 Registration request:', { username, email, displayName });
  
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
    const existingUser = findByEmail(email);
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
    
    const user = create(userData);
    console.log('✅ New user registered:', user);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful! You are now logged in.',
      data: {
        user: user,
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
    const allUsers = getAllUsers();
    
    console.log(`📊 Fetching ${allUsers.length} users`);
    
    res.json({
      success: true,
      message: 'All users retrieved successfully',
      data: {
        users: allUsers.map(user => ({
          ...user,
          userType: 'regular',
          source: 'Main System'
        })),
        count: allUsers.length
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
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Test Auth Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/admin/users`);
  console.log(`🔐 Register API: http://localhost:${PORT}/api/auth/register`);
  console.log(`📊 Current users: ${users.length}`);
});

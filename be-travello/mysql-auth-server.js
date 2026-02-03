const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL connection configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'travello_db',
  charset: 'utf8mb4'
};

// In-memory fallback storage
let memoryUsers = [];
let mysqlAvailable = false;

// Initialize MySQL connection
let pool;
const initMySQL = async () => {
  try {
    pool = mysql.createPool({
      ...mysqlConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    
    // Create users table if not exists
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255),
        display_name VARCHAR(255),
        provider ENUM('manual', 'google', 'github') NOT NULL DEFAULT 'manual',
        role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
        is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
        last_login DATETIME,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_users_email (email),
        INDEX idx_users_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    connection.release();
    mysqlAvailable = true;
    console.log('✅ MySQL users table ready');
    
  } catch (error) {
    console.log('⚠️ MySQL not available, using in-memory storage:', error.message);
    mysqlAvailable = false;
  }
};

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5001",
    "http://127.0.0.1:5001",
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie', 'X-Total-Count'],
  maxAge: 86400
}));

app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname + '/../public'));

// Helper functions
const findByEmail = async (email) => {
  if (mysqlAvailable && pool) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?', 
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('❌ MySQL find error:', error);
      // Fallback to memory
    }
  }
  
  // Fallback to in-memory storage
  return memoryUsers.find(user => user.email === email);
};

const create = async (userData) => {
  const user = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  if (mysqlAvailable && pool) {
    try {
      const [result] = await pool.execute(`
        INSERT INTO users (id, username, email, display_name, provider, role, is_email_verified, last_login)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        user.id,
        user.username,
        user.email,
        user.displayName,
        user.provider,
        user.role,
        user.isEmailVerified,
        user.lastLogin
      ]);
      
      console.log('✅ User saved to MySQL:', user.email);
      return user;
    } catch (error) {
      console.error('❌ MySQL create error:', error);
      // Fallback to memory
    }
  }
  
  // Fallback to in-memory storage
  memoryUsers.push(user);
  console.log('✅ User saved to memory:', user.email);
  return user;
};

const getAllUsers = async () => {
  if (mysqlAvailable && pool) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users ORDER BY created_at DESC'
      );
      console.log(`📊 Retrieved ${rows.length} users from MySQL`);
      return rows;
    } catch (error) {
      console.error('❌ MySQL get all error:', error);
      // Fallback to memory
    }
  }
  
  // Fallback to in-memory storage
  console.log(`📊 Retrieved ${memoryUsers.length} users from memory`);
  return memoryUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Serve pages
app.get('/admin-login', (req, res) => {
  res.sendFile(__dirname + '/../public/admin-login-simple.html');
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/../public/auth.html');
});

app.get('/admin/users', (req, res) => {
  res.sendFile(__dirname + '/../public/admin-users.html');
});

// Health check endpoint
app.get("/health", async (req, res) => {
    const dbStatus = mysqlAvailable ? 'MySQL Connected' : 'In-Memory Storage';
    res.status(200).json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      database: dbStatus,
      mysql_available: mysqlAvailable
    });
});

// API info endpoint
app.get("/api", (req, res) => {
    res.status(200).json({ 
        message: "Travello API - MySQL + Memory Version",
        version: "1.0.0",
        database: mysqlAvailable ? 'MySQL + In-Memory Fallback' : 'In-Memory Only',
        endpoints: {
            health: "GET /health - Health check",
            auth: {
                register: "POST /api/auth/register - User registration",
                login: "POST /api/auth/login - User login"
            },
            admin: {
                users: "GET /api/admin/users - Get all users"
            }
        }
    });
});

// Manual registration endpoint
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, displayName } = req.body;
  const loginPage = req.query.login_page || 'default';
  
  console.log('📝 Registration request:', { username, email, displayName, loginPage });
  
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
    console.log('✅ New user registered:', user.email);
    
    // Generate token
    const token = `manual_signup_token_${user.id}_${Date.now()}`;
    
    // Check if this is an API request
    const isApiRequest = req.headers.accept?.includes('application/json') || 
                         req.headers['content-type']?.includes('application/json');
    
    if (isApiRequest) {
      // For API requests, return JSON response
      return res.status(201).json({
        success: true,
        message: 'Registration successful! You are now logged in.',
        data: {
          user: user,
          token: token,
          userType: 'regular',
          saved_to: mysqlAvailable ? 'MySQL Database' : 'Memory Storage'
        }
      });
    }
    
    // For browser requests, redirect based on login page
    let redirectUrl;
    
    if (loginPage === 'aichatbot') {
      redirectUrl = `http://localhost:5173/ai-chatbot?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=signup&auth=success`;
    } else if (loginPage === 'work') {
      redirectUrl = `http://localhost:5173/work?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=signup&auth=success`;
    } else {
      // Default redirect to admin/users
      redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=signup&auth=success`;
    }
    
    // Redirect to appropriate page
    res.redirect(302, redirectUrl);
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Manual login endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const loginPage = req.query.login_page || 'default';
  
  console.log('🔐 Login request:', { email, loginPage });
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    let user = await findByEmail(email);
    
    if (!user) {
      // Create new user if doesn't exist (universal access)
      const userData = {
        username: email.split('@')[0] + Math.floor(Math.random() * 1000),
        email: email,
        displayName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        provider: 'manual',
        role: 'user',
        isEmailVerified: true,
        lastLogin: new Date()
      };
      
      user = await create(userData);
      console.log('✅ New user created during login:', user.email);
    } else {
      // Update last login time
      if (mysqlAvailable && pool) {
        try {
          await pool.execute(
            'UPDATE users SET last_login = ? WHERE id = ?',
            [new Date(), user.id]
          );
        } catch (error) {
          console.error('❌ MySQL update error:', error);
        }
      }
      user.lastLogin = new Date();
      console.log('✅ Existing user logged in:', user.email);
    }
    
    // Generate token
    const token = `manual_login_token_${user.id}_${Date.now()}`;
    
    // Check if this is an API request
    const isApiRequest = req.headers.accept?.includes('application/json') || 
                         req.headers['content-type']?.includes('application/json');
    
    if (isApiRequest) {
      // For API requests, return JSON response
      return res.json({
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          user: user,
          token: token,
          userType: 'regular',
          saved_to: mysqlAvailable ? 'MySQL Database' : 'Memory Storage'
        }
      });
    }
    
    // For browser requests, redirect based on login page
    let redirectUrl;
    
    if (loginPage === 'aichatbot') {
      redirectUrl = `http://localhost:5173/ai-chatbot?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=login&auth=success`;
    } else if (loginPage === 'work') {
      redirectUrl = `http://localhost:5173/work?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=login&auth=success`;
    } else {
      // Default redirect to admin/users
      redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify(user))}&action=login&auth=success`;
    }
    
    // Redirect to appropriate page
    res.redirect(302, redirectUrl);
    
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get all users (admin endpoint)
app.get("/api/admin/users", async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    
    console.log(`📊 Fetching ${allUsers.length} users for admin panel`);
    
    res.json({
      success: true,
      message: 'All users retrieved successfully',
      data: {
        users: allUsers.map(user => ({
          ...user,
          userType: 'regular',
          source: mysqlAvailable ? 'MySQL Database' : 'Memory Storage'
        })),
        count: allUsers.length,
        database_type: mysqlAvailable ? 'MySQL' : 'Memory'
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
  await initMySQL();
  
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Travello Auth Server running on port ${PORT}`);
    console.log(`🗄️  Database: ${mysqlAvailable ? 'MySQL + Memory Fallback' : 'Memory Only'}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`👥 Users API: http://localhost:${PORT}/api/admin/users`);
    console.log(`🔐 Register API: http://localhost:${PORT}/api/auth/register`);
    console.log(`🔐 Login API: http://localhost:${PORT}/api/auth/login`);
    console.log(`📝 Admin login: http://localhost:${PORT}/admin-login`);
    console.log(`📝 User login: http://localhost:${PORT}/login`);
  });
};

startServer().catch(console.error);

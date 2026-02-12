const express = require('express');
const cors = require('cors');

// Simple in-memory user storage for testing
let users = [];
let userIdCounter = 1;

// Simple in-memory shop storage for testing
let shops = [];
let shopIdCounter = 1;

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

// Shop helper functions
const createShop = (shopData) => {
  const newShop = {
    id: `shop_${shopIdCounter++}_${Date.now()}`,
    ...shopData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  shops.push(newShop);
  return newShop;
};

const getAllShops = () => {
  return shops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const findShopById = (id) => {
  return shops.find(shop => shop.id === id);
};

const updateShop = (id, updateData) => {
  const index = shops.findIndex(shop => shop.id === id);
  if (index !== -1) {
    shops[index] = { ...shops[index], ...updateData, updatedAt: new Date() };
    return shops[index];
  }
  return null;
};

const deleteShop = (id) => {
  const index = shops.findIndex(shop => shop.id === id);
  if (index !== -1) {
    const deleted = shops.splice(index, 1)[0];
    return deleted;
  }
  return null;
};

// Serve admin login page
app.get('/admin-login', (req, res) => {
  res.sendFile(__dirname + '/../public/admin-login-simple.html');
});

// Serve login/signup page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/../public/auth.html');
});

// Serve admin users page
app.get('/admin/users', (req, res) => {
  res.sendFile(__dirname + '/../public/admin-users.html');
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/api", (req, res) => {
    res.status(200).json({ 
        message: "Travello API - Simple Version",
        version: "1.0.0",
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
          userType: 'regular'
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
    let user = findByEmail(email);
    
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
      
      user = create(userData);
      console.log('✅ New user created during login:', user);
    } else {
      // Update last login time
      user.lastLogin = new Date();
      user.updatedAt = new Date();
      console.log('✅ Existing user logged in:', user);
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
          userType: 'regular'
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

// Get all shops (public endpoint)
app.get("/api/shops", async (req, res) => {
  try {
    const allShops = getAllShops();
    
    console.log(`📊 Fetching ${allShops.length} shops for frontend`);
    
    res.json(allShops);
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shops',
      error: error.message
    });
  }
});

// Get shop by ID
app.get("/api/shops/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const shop = findShopById(id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    res.json(shop);
  } catch (error) {
    console.error('Error fetching shop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop',
      error: error.message
    });
  }
});

// Create shop
app.post("/api/shops", async (req, res) => {
  try {
    const shopData = req.body;
    
    console.log('🛍️ Creating new shop:', shopData);
    
    const newShop = createShop(shopData);
    console.log('✅ New shop created:', newShop);
    
    res.status(201).json(newShop);
  } catch (error) {
    console.error('Error creating shop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shop',
      error: error.message
    });
  }
});

// Update shop
app.put("/api/shops/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('🔄 Updating shop:', id, updateData);
    
    const updatedShop = updateShop(id, updateData);
    
    if (!updatedShop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    console.log('✅ Shop updated:', updatedShop);
    res.json(updatedShop);
  } catch (error) {
    console.error('Error updating shop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shop',
      error: error.message
    });
  }
});

// Delete shop
app.delete("/api/shops/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Deleting shop:', id);
    
    const deletedShop = deleteShop(id);
    
    if (!deletedShop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    console.log('✅ Shop deleted:', deletedShop);
    res.json({ success: true, message: 'Shop deleted successfully' });
  } catch (error) {
    console.error('Error deleting shop:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shop',
      error: error.message
    });
  }
});

// Get shop categories
app.get("/api/shops/categories", async (req, res) => {
  try {
    const allShops = getAllShops();
    const categories = [...new Set(allShops.map(shop => shop.category))];
    
    console.log(`📊 Fetching ${categories.length} categories`);
    
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
});

// Get all users (admin endpoint)
app.get("/api/admin/users", async (req, res) => {
  try {
    const allUsers = getAllUsers();
    
    console.log(`📊 Fetching ${allUsers.length} users for admin panel`);
    
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Travello Auth Server running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🛍️ Shops API: http://localhost:${PORT}/api/shops`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/admin/users`);
  console.log(`🔐 Register API: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔐 Login API: http://localhost:${PORT}/api/auth/login`);
  console.log(`📊 Current users: ${users.length}`);
  console.log(`📊 Current shops: ${shops.length}`);
  console.log(`📝 Admin login: http://localhost:${PORT}/admin-login`);
  console.log(`📝 User login: http://localhost:${PORT}/login`);
});

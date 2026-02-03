const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { User, findByGoogleId, findByEmail, create, initUser, recordLoginHistory, getAllUsers, getUserById, updateUser, deleteUser } = require('./models/User.model.mysql.js');
const { findShopUserByEmail, findShopUserByGoogleId, createShopUser, initShopUser, updateShopUser, recordShopLoginHistory, getAllShopUsers, getShopUserById, deleteShopUser } = require('./models/ShopUser.model.mysql.js');

const app = express();

// Serve swagger.json
app.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// Swagger documentation with OAuth2 redirect/popup authentication
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Travello API Documentation",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: "none",
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    tryItOutEnabled: true,
    oauth2RedirectUrl: `http://localhost:5000/oauth2-redirect.html`,
    initOAuth: {
      usePkceWithAuthorizationCodeGrant: true,
      clientId: process.env.GOOGLE_CLIENT_ID || '858988102830-p3lbl3dlnqcht246c3huji4nplk2s9in.apps.googleusercontent.com',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      appName: "Travello API",
      scopeSeparator: " ",
      scopes: ["profile", "email"],
      additionalQueryStringParams: {
        access_type: "offline",
        prompt: "select_account"
      }
    },
    configUrl: '/swagger.json?v=' + Date.now()
  }
}));

// Middleware
app.use(cors({ 
  origin: [
    process.env.CORS_ORIGIN || "http://localhost:5173",
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5001",
    "http://127.0.0.1:5001",
    "http://localhost:5000/api-docs",
    "http://localhost:5001/api-docs",
    "http://localhost:5000/api-docs/oauth2-redirect.html",
    "http://localhost:5001/swagger-oauth2-redirect",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5000/api-docs",
    "http://localhost:5001/api-docs",
    "http://localhost:5000/api-docs/oauth2-redirect.html",
    "http://localhost:5001/swagger-oauth2-redirect",
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

// Session middleware for Passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// OAuth2 redirect handler for Swagger UI
app.get('/swagger-oauth2-redirect', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger-oauth2-redirect.html'));
});

// OAuth2 redirect handler for Swagger UI (standard path)
app.get('/oauth2-redirect.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'oauth2-redirect.html'));
});

// Serve admin login page
app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login-simple.html'));
});

// Serve login/signup page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'auth.html'));
});

// Serve AI Chatbot login page
app.get('/login-aichatbot', (req, res) => {
  res.sendFile(path.join(__dirname, 'login-aichatbot.html'));
});

// Serve AI Chatbot signup page
app.get('/signup-aichatbot', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup-aichatbot.html'));
});

// Serve Shop login page
app.get('/login-shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'login-shop.html'));
});

// Serve Shop signup page
app.get('/signup-shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup-shop.html'));
});

// Serve Shop page
app.get('/shop', (req, res) => {
  res.sendFile(path.join(__dirname, 'shop.html'));
});

// Serve admin landing management page
app.get('/admin/landing', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-landing-management.html'));
});

// Serve admin portfolio management page
app.get('/admin/portfolio', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-portfolio-management.html'));
});

// Serve admin users page
app.get('/admin/users', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-users.html'));
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/api", (req, res) => {
    res.status(200).json({ 
        message: "Travello API",
        version: "1.0.0",
        endpoints: {
            health: "GET /health - Health check",
            docs: "GET /api-docs - Swagger Documentation",
            auth: {
                login: "POST /api/auth/login - User login",
                register: "POST /api/auth/register - User registration",
                me: "GET /api/auth/me - Get current user",
                google: "GET /api/auth/google - Google OAuth"
            },
            admin: {
                users: "GET /api/admin/users - Get all users",
                user: "GET /api/admin/users/:id - Get user by ID"
            }
        }
    });
});

// Basic auth routes
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const loginPage = req.query.login_page || 'default';
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  try {
    let user, userModel;
    
    // Check if this is a shop login
    if (loginPage === 'shop') {
      // Initialize shop user database
      await initShopUser();
      
      // Check if shop user exists
      user = await findShopUserByEmail(email);
      userModel = 'shop';
      
      if (!user) {
        // Create new shop user if doesn't exist (universal access)
        const userData = {
          username: email.split('@')[0] + Math.floor(Math.random() * 1000),
          email: email,
          displayName: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
          provider: 'manual',
          role: 'customer',
          isEmailVerified: true,
          lastLogin: new Date()
        };
        
        user = await createShopUser(userData);
        console.log('✅ New shop user created:', user.toJSON());
      } else {
        // Update last login time
        await updateShopUser(user.id, { lastLogin: new Date() });
        console.log('✅ Existing shop user logged in:', user.toJSON());
      }
      
      // Record shop login history
      await recordShopLoginHistory(user.id, {
        method: 'manual',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    } else {
      // Initialize regular user database
      await initUser();
      
      // Check if user exists
      user = await findByEmail(email);
      userModel = 'regular';
      
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
        console.log('✅ New user created:', user.toJSON());
      } else {
        // Update last login time
        await User.update(
          { lastLogin: new Date() },
          { where: { id: user.id } }
        );
        console.log('✅ Existing user logged in:', user.toJSON());
      }
      
      // Record login history
      await recordLoginHistory(user.id, {
        method: 'manual',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    }
    
    // Generate JWT token
    const token = `${userModel}_login_token_${user.id}_${Date.now()}`;
    
    // Create user object for response
    const userResponse = user.toJSON();
    
    // Check if this is an API request (JSON response) or browser redirect
    const isApiRequest = req.headers.accept?.includes('application/json') || 
                         req.headers['content-type']?.includes('application/json');
    
    if (isApiRequest) {
      // For API requests, return JSON response
      return res.json({
        success: true,
        message: 'Login successful! Welcome back.',
        data: {
          user: userResponse,
          token: token,
          userType: userModel
        }
      });
    }
    
    // For browser requests, redirect based on user type and login page
    let redirectUrl;
    
    if (loginPage === 'aichatbot') {
      redirectUrl = `http://localhost:5173/ai-chatbot?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=login&auth=success`;
    } else if (loginPage === 'shop') {
      redirectUrl = `http://localhost:5173/shop?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=login&auth=success`;
    } else {
      // Default redirect to admin/users
      redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=login&auth=success`;
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

app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, displayName } = req.body;
  const loginPage = req.query.login_page || 'default';
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
  }

  // Allow ANY email format for universal access
  // Minimal validation only for basic structure
  if (!email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please include @ in email'
    });
  }

  try {
    let user, userModel;
    
    // Check if this is a shop registration
    if (loginPage === 'shop') {
      // Initialize shop user database
      await initShopUser();
      
      // Check if shop user already exists
      const existingUser = await findShopUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Shop user with this email already exists'
        });
      }
      
      // Create new shop user
      const userData = {
        username: username || email.split('@')[0],
        email: email,
        displayName: displayName || username || email.split('@')[0],
        provider: 'manual',
        role: 'customer',
        isEmailVerified: true,
        lastLogin: new Date()
      };
      
      user = await createShopUser(userData);
      userModel = 'shop';
      console.log('✅ New shop user registered:', user.toJSON());
      
      // Record shop login history for signup
      await recordShopLoginHistory(user.id, {
        method: 'manual',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    } else {
      // Initialize regular user database
      await initUser();
      
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
      
      user = await create(userData);
      userModel = 'regular';
      console.log('✅ New user registered:', user.toJSON());
      
      // Record login history for signup
      await recordLoginHistory(user.id, {
        method: 'manual',
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent')
      });
    }
    
    // Generate JWT token
    const token = `${userModel}_signup_token_${user.id}_${Date.now()}`;
    
    // Create user object for response
    const userResponse = user.toJSON();
    
    // Check if this is an API request (JSON response) or browser redirect
    const isApiRequest = req.headers.accept?.includes('application/json') || 
                         req.headers['content-type']?.includes('application/json');
    
    if (isApiRequest) {
      // For API requests, return JSON response
      return res.status(201).json({
        success: true,
        message: 'Registration successful! You are now logged in.',
        data: {
          user: userResponse,
          token: token,
          userType: userModel
        }
      });
    }
    
    // For browser requests, redirect based on user type and login page
    let redirectUrl;
    
    if (loginPage === 'aichatbot') {
      redirectUrl = `http://localhost:5173/ai-chatbot?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=signup&auth=success`;
    } else if (loginPage === 'shop') {
      redirectUrl = `http://localhost:5173/shop?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=signup&auth=success`;
    } else {
      // Default redirect to admin/users
      redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=signup&auth=success`;
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

// Get all users (admin endpoint) - Unified for regular and shop users
app.get("/api/admin/users", async (req, res) => {
  try {
    await initUser();
    await initShopUser();
    
    const regularUsers = await getAllUsers();
    const shopUsers = await getAllShopUsers();
    
    // Combine and format users
    const allUsers = [
      ...regularUsers.map(user => ({
        ...user.toJSON(),
        userType: 'regular',
        source: 'Main System'
      })),
      ...shopUsers.map(user => ({
        ...user.toJSON(),
        userType: 'shop',
        source: 'Shop System'
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({
      success: true,
      message: 'All users retrieved successfully',
      data: {
        users: allUsers,
        count: allUsers.length,
        regularUsersCount: regularUsers.length,
        shopUsersCount: shopUsers.length
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

// Get user by ID (admin endpoint) - Unified for regular and shop users
app.get("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await initUser();
    await initShopUser();
    
    let user = await getUserById(id);
    let userType = 'regular';
    
    if (!user) {
      user = await getShopUserById(id);
      userType = 'shop';
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: {
          ...user.toJSON(),
          userType: userType
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
});

// Create user (admin endpoint) - Support both regular and shop users
app.post("/api/admin/users", async (req, res) => {
  try {
    const userData = req.body;
    const userType = userData.userType || 'regular';
    
    if (userType === 'shop') {
      await initShopUser();
      
      // Check if shop user already exists
      const existingUser = await findShopUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Shop user with this email already exists'
        });
      }
      
      const user = await createShopUser({
        ...userData,
        role: userData.role || 'customer'
      });
      console.log('✅ New shop user created by admin:', user.toJSON());
      
      res.status(201).json({
        success: true,
        message: 'Shop user created successfully',
        data: {
          user: {
            ...user.toJSON(),
            userType: 'shop'
          }
        }
      });
    } else {
      await initUser();
      
      // Check if user already exists
      const existingUser = await findByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      
      const user = await create(userData);
      console.log('✅ New user created by admin:', user.toJSON());
      
      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: {
          user: {
            ...user.toJSON(),
            userType: 'regular'
          }
        }
      });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
});

// Update user (admin endpoint) - Support both regular and shop users
app.put("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    await initUser();
    await initShopUser();
    
    let user = await getUserById(id);
    let userType = 'regular';
    
    if (!user) {
      user = await getShopUserById(id);
      userType = 'shop';
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let updatedUser;
    if (userType === 'shop') {
      updatedUser = await updateShopUser(id, updateData);
    } else {
      updatedUser = await updateUser(id, updateData);
    }
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          ...updatedUser.toJSON(),
          userType: userType
        }
      }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
});

// Delete user (admin endpoint) - Support both regular and shop users
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await initUser();
    await initShopUser();
    
    let user = await getUserById(id);
    let userType = 'regular';
    
    if (!user) {
      user = await getShopUserById(id);
      userType = 'shop';
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    let deleted;
    if (userType === 'shop') {
      deleted = await deleteShopUser(id);
    } else {
      deleted = await deleteUser(id);
    }
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: `${userType === 'shop' ? 'Shop user' : 'User'} deleted successfully`,
      data: {
        userType: userType
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
});

// Shop CRUD endpoints
const { 
  Shop, 
  createShop, 
  getAllShops, 
  getShopById, 
  updateShop, 
  deleteShop, 
  getShopsByUser, 
  getShopCategories,
  initShop 
} = require('./models/Shop.model.mysql.js');

// Get all shops
app.get("/api/shops", async (req, res) => {
  try {
    await initShop();
    const filters = {
      category: req.query.category,
      status: req.query.status,
      search: req.query.search,
      includeUser: req.query.includeUser === 'true'
    };
    
    const shops = await getAllShops(filters);
    
    res.json({
      success: true,
      message: 'Shops retrieved successfully',
      data: {
        shops: shops.map(shop => shop.toJSON()),
        count: shops.length
      }
    });
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
    await initShop();
    
    const shop = await getShopById(id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Shop retrieved successfully',
      data: {
        shop: shop.toJSON()
      }
    });
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
    await initShop();
    
    const shop = await createShop(shopData);
    console.log('✅ New shop created:', shop.toJSON());
    
    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: {
        shop: shop.toJSON()
      }
    });
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
    await initShop();
    
    const shop = await updateShop(id, updateData);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: {
        shop: shop.toJSON()
      }
    });
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
    await initShop();
    
    const deleted = await deleteShop(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Shop deleted successfully'
    });
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
    await initShop();
    const categories = await getShopCategories();
    
    res.json({
      success: true,
      message: 'Shop categories retrieved successfully',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching shop categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop categories',
      error: error.message
    });
  }
});

// Landing Page CRUD endpoints
const { 
  LandingPage, 
  createLandingPage, 
  getAllLandingPages, 
  getLandingPageById, 
  updateLandingPage, 
  deleteLandingPage,
  getLandingPagesBySection,
  initLandingPage 
} = require('./models/LandingPage.model.mysql.js');

// Get all landing pages
app.get("/api/landing-pages", async (req, res) => {
  try {
    await initLandingPage();
    const filters = {
      section: req.query.section,
      isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
      includeUser: req.query.includeUser === 'true'
    };
    
    const pages = await getAllLandingPages(filters);
    
    res.json({
      success: true,
      message: 'Landing pages retrieved successfully',
      data: {
        pages: pages.map(page => page.toJSON()),
        count: pages.length
      }
    });
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landing pages',
      error: error.message
    });
  }
});

// Get landing page by ID
app.get("/api/landing-pages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await initLandingPage();
    
    const page = await getLandingPageById(id);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Landing page not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Landing page retrieved successfully',
      data: {
        page: page.toJSON()
      }
    });
  } catch (error) {
    console.error('Error fetching landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landing page',
      error: error.message
    });
  }
});

// Create landing page
app.post("/api/landing-pages", async (req, res) => {
  try {
    const pageData = req.body;
    await initLandingPage();
    
    const page = await createLandingPage(pageData);
    console.log('✅ New landing page created:', page.toJSON());
    
    res.status(201).json({
      success: true,
      message: 'Landing page created successfully',
      data: {
        page: page.toJSON()
      }
    });
  } catch (error) {
    console.error('Error creating landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create landing page',
      error: error.message
    });
  }
});

// Update landing page
app.put("/api/landing-pages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    await initLandingPage();
    
    const page = await updateLandingPage(id, updateData);
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Landing page not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Landing page updated successfully',
      data: {
        page: page.toJSON()
      }
    });
  } catch (error) {
    console.error('Error updating landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update landing page',
      error: error.message
    });
  }
});

// Delete landing page
app.delete("/api/landing-pages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await initLandingPage();
    
    const deleted = await deleteLandingPage(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Landing page not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Landing page deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting landing page:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete landing page',
      error: error.message
    });
  }
});

// Get landing pages by section
app.get("/api/landing-pages/section/:section", async (req, res) => {
  try {
    const { section } = req.params;
    await initLandingPage();
    
    const pages = await getLandingPagesBySection(section);
    
    res.json({
      success: true,
      message: 'Landing pages by section retrieved successfully',
      data: {
        pages: pages.map(page => page.toJSON()),
        section: section,
        count: pages.length
      }
    });
  } catch (error) {
    console.error('Error fetching landing pages by section:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch landing pages by section',
      error: error.message
    });
  }
});

// Portfolio CRUD endpoints
const { 
  Portfolio, 
  createPortfolio, 
  getAllPortfolios, 
  getPortfolioById, 
  updatePortfolio, 
  deletePortfolio,
  getFeaturedPortfolios,
  getPortfoliosByCategory,
  getPortfolioCategories,
  initPortfolio 
} = require('./models/Portfolio.model.mysql.js');

// Get all portfolios
app.get("/api/portfolios", async (req, res) => {
  try {
    await initPortfolio();
    const filters = {
      category: req.query.category,
      featured: req.query.featured === 'true' ? true : req.query.featured === 'false' ? false : undefined,
      published: req.query.published === 'true' ? true : req.query.published === 'false' ? false : undefined,
      search: req.query.search,
      includeUser: req.query.includeUser === 'true'
    };
    
    const portfolios = await getAllPortfolios(filters);
    
    res.json({
      success: true,
      message: 'Portfolios retrieved successfully',
      data: {
        portfolios: portfolios.map(portfolio => portfolio.toJSON()),
        count: portfolios.length
      }
    });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios',
      error: error.message
    });
  }
});

// Get portfolio by ID
app.get("/api/portfolios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await initPortfolio();
    
    const portfolio = await getPortfolioById(id);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Portfolio retrieved successfully',
      data: {
        portfolio: portfolio.toJSON()
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message
    });
  }
});

// Create portfolio
app.post("/api/portfolios", async (req, res) => {
  try {
    const portfolioData = req.body;
    await initPortfolio();
    
    const portfolio = await createPortfolio(portfolioData);
    console.log('✅ New portfolio created:', portfolio.toJSON());
    
    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: {
        portfolio: portfolio.toJSON()
      }
    });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create portfolio',
      error: error.message
    });
  }
});

// Update portfolio
app.put("/api/portfolios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    await initPortfolio();
    
    const portfolio = await updatePortfolio(id, updateData);
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Portfolio updated successfully',
      data: {
        portfolio: portfolio.toJSON()
      }
    });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio',
      error: error.message
    });
  }
});

// Delete portfolio
app.delete("/api/portfolios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await initPortfolio();
    
    const deleted = await deletePortfolio(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio',
      error: error.message
    });
  }
});

// Get featured portfolios
app.get("/api/portfolios/featured", async (req, res) => {
  try {
    await initPortfolio();
    const limit = parseInt(req.query.limit) || 6;
    
    const portfolios = await getFeaturedPortfolios(limit);
    
    res.json({
      success: true,
      message: 'Featured portfolios retrieved successfully',
      data: {
        portfolios: portfolios.map(portfolio => portfolio.toJSON()),
        count: portfolios.length
      }
    });
  } catch (error) {
    console.error('Error fetching featured portfolios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured portfolios',
      error: error.message
    });
  }
});

// Get portfolios by category
app.get("/api/portfolios/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    await initPortfolio();
    
    const portfolios = await getPortfoliosByCategory(category);
    
    res.json({
      success: true,
      message: 'Portfolios by category retrieved successfully',
      data: {
        portfolios: portfolios.map(portfolio => portfolio.toJSON()),
        category: category,
        count: portfolios.length
      }
    });
  } catch (error) {
    console.error('Error fetching portfolios by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios by category',
      error: error.message
    });
  }
});

// Get portfolio categories
app.get("/api/portfolios/categories", async (req, res) => {
  try {
    await initPortfolio();
    const categories = await getPortfolioCategories();
    
    res.json({
      success: true,
      message: 'Portfolio categories retrieved successfully',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio categories',
      error: error.message
    });
  }
});

// Blog Articles CRUD API
const { 
  BlogArticle, 
  createBlogArticle, 
  getAllBlogArticles, 
  getBlogArticleById, 
  getBlogArticleBySlug,
  updateBlogArticle, 
  deleteBlogArticle, 
  getPublishedArticles,
  getBlogCategories,
  incrementViewCount,
  initBlogArticle 
} = require('./models/BlogArticle.model.mysql');

// Get all blog articles (admin)
app.get("/api/admin/blog/articles", async (req, res) => {
  try {
    await initBlogArticle();
    const { status, category, limit = 50, offset = 0 } = req.query;
    
    const result = await getAllBlogArticles({ status, category, limit, offset });
    
    res.json({
      success: true,
      message: 'Blog articles retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error fetching blog articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog articles',
      error: error.message
    });
  }
});

// Get blog article by ID (admin)
app.get("/api/admin/blog/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await initBlogArticle();
    
    const article = await getBlogArticleById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Blog article not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog article retrieved successfully',
      data: { article }
    });
  } catch (error) {
    console.error('Error fetching blog article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog article',
      error: error.message
    });
  }
});

// Create blog article (admin)
app.post("/api/admin/blog/articles", async (req, res) => {
  try {
    const articleData = req.body;
    await initBlogArticle();
    
    const article = await createBlogArticle(articleData);
    
    res.status(201).json({
      success: true,
      message: 'Blog article created successfully',
      data: { article }
    });
  } catch (error) {
    console.error('Error creating blog article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create blog article',
      error: error.message
    });
  }
});

// Update blog article (admin)
app.put("/api/admin/blog/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    await initBlogArticle();
    
    const article = await updateBlogArticle(id, updateData);
    
    res.json({
      success: true,
      message: 'Blog article updated successfully',
      data: { article }
    });
  } catch (error) {
    console.error('Error updating blog article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update blog article',
      error: error.message
    });
  }
});

// Delete blog article (admin)
app.delete("/api/admin/blog/articles/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await initBlogArticle();
    
    const deleted = await deleteBlogArticle(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Blog article not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Blog article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete blog article',
      error: error.message
    });
  }
});

// Get published articles (frontend)
app.get("/api/blog/articles", async (req, res) => {
  try {
    await initBlogArticle();
    const { category, limit = 10, offset = 0 } = req.query;
    
    const result = await getPublishedArticles({ category, limit, offset });
    
    res.json({
      success: true,
      message: 'Published articles retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error fetching published articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch published articles',
      error: error.message
    });
  }
});

// Get blog article by slug (frontend)
app.get("/api/blog/articles/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    await initBlogArticle();
    
    const article = await getBlogArticleBySlug(slug);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Blog article not found'
      });
    }
    
    // Increment view count
    await incrementViewCount(article.id);
    
    res.json({
      success: true,
      message: 'Blog article retrieved successfully',
      data: { article }
    });
  } catch (error) {
    console.error('Error fetching blog article by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog article',
      error: error.message
    });
  }
});

// Get blog categories (frontend)
app.get("/api/blog/categories", async (req, res) => {
  try {
    await initBlogArticle();
    const categories = await getBlogCategories();
    
    res.json({
      success: true,
      message: 'Blog categories retrieved successfully',
      data: { categories }
    });
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch blog categories',
      error: error.message
    });
  }
});

// Get shops by user
app.get("/api/users/:userId/shops", async (req, res) => {
  try {
    const { userId } = req.params;
    await initShop();
    
    const shops = await getShopsByUser(userId);
    
    res.json({
      success: true,
      message: 'User shops retrieved successfully',
      data: {
        shops: shops.map(shop => shop.toJSON()),
        count: shops.length
      }
    });
  } catch (error) {
    console.error('Error fetching user shops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user shops',
      error: error.message
    });
  }
});

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
  scope: ['profile', 'email'],
  prompt: 'consent' // Force consent screen
}, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google OAuth Profile:', profile);
    
    // Initialize user database
    await initUser();
    
    // Check if user already exists by Google ID
    let user = await findByGoogleId(profile.id);
    
    if (!user) {
      // Check if user exists by email
      user = await findByEmail(profile.emails[0].value);
      
      if (!user) {
        // Create new user
        const userData = {
          googleId: profile.id,
          username: profile.emails[0].value.split('@')[0],
          email: profile.emails[0].value,
          displayName: profile.displayName,
          profilePicture: profile.photos[0]?.value,
          provider: 'google',
          role: 'user',
          isEmailVerified: profile.emails[0]?.verified || true,
          lastLogin: new Date()
        };
        
        user = await create(userData);
        console.log('✅ New Google user created:', user.toJSON());
      } else {
        // Update existing user with Google info
        await User.update(
          { 
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value,
            lastLogin: new Date()
          },
          { where: { id: user.id } }
        );
        console.log('✅ Existing user linked with Google:', user.toJSON());
      }
    } else {
      // Update last login time
      await User.update(
        { lastLogin: new Date() },
        { where: { id: user.id } }
      );
      console.log('✅ Existing Google user logged in:', user.toJSON());
    }
    
    return done(null, user);
  } catch (error) {
    console.error('Google OAuth Error:', error);
    return done(error, null);
  }
}));

// Serialize/deserialize user for sessions
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth test endpoint
app.get("/api/auth/google/test", (req, res) => {
  res.json({
    success: true,
    message: 'Google OAuth is configured',
    data: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
      swaggerUiUrl: 'http://localhost:5173/admin/users',
      oauthRedirectUri: 'http://localhost:5000/oauth2-redirect.html',
      testUrl: `http://localhost:5000/api/auth/google?mode=signup`,
      instructions: [
        "1. Add these URIs to Google Cloud Console:",
        "   - http://localhost:5000/api/auth/google/callback",
        "   - http://localhost:5000/oauth2-redirect.html",
        "2. Click 'Authorize' in Swagger UI",
        "3. Select 'googleOAuth' and complete authentication",
        "4. Token will be stored for API requests"
      ],
      googleConsoleUrl: 'https://console.cloud.google.com/apis/credentials'
    }
  });
});

// Google OAuth endpoints (IMPROVED - Support both popup and redirect)
app.get("/api/auth/google", (req, res, next) => {
  const mode = req.query.mode || 'login';
  const loginPage = req.query.login_page || 'default';
  const responseType = req.query.response_type || 'code';
  
  // Store mode and login_page in session for callback
  req.session.oauth_mode = mode;
  req.session.login_page = loginPage;
  req.session.response_type = responseType;
  
  // Check if this is a popup request (from Swagger UI or frontend)
  const isPopup = req.headers.accept?.includes('application/json') || req.query.popup === 'true';
  
  if (isPopup) {
    // For popup/JSON requests, return the Google OAuth URL
    const authUrl = `https://accounts.google.com/oauth/authorize?` +
      `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(process.env.GOOGLE_CALLBACK_URL)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('profile email')}&` +
      `access_type=offline&` +
      `prompt=select_account&` +
      `state=${mode}`;
    
    return res.json({
      success: true,
      message: 'Google OAuth URL generated',
      data: { 
        authUrl,
        mode,
        instructions: 'Open this URL in a browser to authenticate'
      }
    });
  }
  
  // For direct browser requests, use Passport authentication
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    accessType: 'offline',
    prompt: 'select_account',
    state: mode
  })(req, res, next);
});

app.get("/api/auth/google/callback", 
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5173/admin/users?auth=error',
    session: true,
    failureMessage: 'Google OAuth authentication failed'
  }),
  (req, res) => {
    try {
      // Successful authentication with REAL Google
      const user = req.user;
      const loginPage = req.session.login_page || 'default'; // Get login page
      const mode = req.session.oauth_mode || 'login'; // Get mode
      
      console.log('Google OAuth callback successful:', { user, mode, loginPage });
      
      // Generate JWT token
      const token = `google_${mode}_token_${user.id}_${Date.now()}`;
      
      // Check if this is a popup request (from Swagger UI)
      const isPopup = req.headers.accept?.includes('application/json') || 
                     req.query.popup === 'true' ||
                     req.get('User-Agent')?.includes('Swagger');
      
      if (isPopup) {
        // For popup requests, return token and user data as JSON
        return res.json({
          success: true,
          message: 'Google OAuth authentication successful',
          data: {
            user: {
              id: user.id,
              email: user.email,
              username: user.email?.split('@')[0] || user.displayName,
              displayName: user.displayName,
              photo: user.photos?.[0]?.value,
              provider: 'google'
            },
            token,
            mode,
            instructions: 'Use this token for authenticated requests'
          }
        });
      }
      
      // For browser redirects, create callback URL for frontend
      const userResponse = user.toJSON();
      let redirectUrl;
      
      if (loginPage === 'aichatbot') {
        redirectUrl = `http://localhost:5173/ai-chatbot?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=${mode}&auth=success`;
      } else if (loginPage === 'shop') {
        redirectUrl = `http://localhost:5173/shop?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=${mode}&auth=success`;
      } else {
        // Default redirect to admin/users
        redirectUrl = `http://localhost:5173/admin/users?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}&action=${mode}&auth=success`;
      }
      
      // Clear session
      req.session.destroy();
      
      // Redirect to frontend
      res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      
      // Check if this is a popup request
      const isPopup = req.headers.accept?.includes('application/json') || req.query.popup === 'true';
      
      if (isPopup) {
        return res.status(500).json({
          success: false,
          message: 'Google OAuth callback failed',
          error: error.message || 'Unknown error'
        });
      }
      
      // For browser redirects, redirect to error page
      const errorUrl = `http://localhost:5173/admin/users?auth=error&message=callback_failed`;
      res.redirect(errorUrl);
    }
  }
);

// Default route redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Payment routes
const paymentRoutes = require('./routes/payment.routes.js');
app.use('/api/payments', paymentRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Catch-all handler for undefined routes (must be last)
app.use((req, res) => {
    res.status(404).json({ 
        error: "Route not found",
        message: `Cannot ${req.method} ${req.originalUrl}`,
        availableRoutes: {
            "GET /health": "Health check",
            "GET /api": "API information", 
            "GET /api-docs": "Swagger documentation",
            "POST /api/auth/login": "User login",
            "POST /api/auth/register": "User registration",
            "GET /api/auth/me": "Get current user",
            "POST /api/auth/logout": "User logout",
            "GET /api/auth/google": "Google OAuth login",
            "GET /api/auth/google/callback": "Google OAuth callback",
            "GET /api/admin/users": "Get all users",
            "GET /api/admin/users/:id": "Get user by ID"
        }
    });
});

const PORT = process.env.PORT || 5000;

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Travello API Server running on http://localhost:${PORT}`);
    console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📋 API Info: http://localhost:${PORT}/api`);
  });
}

module.exports = app;

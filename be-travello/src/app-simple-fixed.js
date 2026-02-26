const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const { Server } = require('socket.io');
const http = require('http');
const jwt = require('jsonwebtoken');
const { User, findByGoogleId, findByEmail, create, initUser, recordLoginHistory, getAllUsers, getUserById, updateUser, deleteUser } = require('./models/User.model.mysql.js');
const { findShopUserByEmail, findShopUserByGoogleId, createShopUser, initShopUser, updateShopUser, recordShopLoginHistory, getAllShopUsers, getShopUserById, deleteShopUser } = require('./models/ShopUser.model.mysql.js');
const { ShopProduct, initShopProduct, createShopProduct, getAllShopProducts, getShopProductById, updateShopProduct, deleteShopProduct, getShopProductCategories } = require('./models/ShopProducts.model.mysql.js');
const SocketChatController = require('./controllers/socket-chat.controller.js');
const { initChatMessage } = require('./models/ChatMessage.model.js');

const app = express();
const server = http.createServer(app);

// Generate JWT token function
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user' },
    process.env.JWT_SECRET || 'fallback_jwt_secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178", "http://localhost:5000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

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
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
    "http://localhost:5177",
    "http://127.0.0.1:5177",
    "http://localhost:5178",
    "http://127.0.0.1:5178",
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

// Socket.IO test endpoint
app.get('/api/test/socket', (req, res) => {
  try {
    const io = require('socket.io')(require('http').createServer());
    res.json({
      success: true,
      message: 'Socket.IO test endpoint',
      data: {
        timestamp: new Date().toISOString(),
        serverStatus: 'running',
        socketConnections: 'Check console for connection count'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Socket.IO test failed',
      error: error.message
    });
  }
});

// Test endpoint for chat messages
app.get('/api/test/chat-messages', async (req, res) => {
  try {
    const { getMessagesByRoom, getAllUnreadMessages } = require('./models/ChatMessage.model.js');
    
    // Test get all unread messages
    const unreadMessages = await getAllUnreadMessages();
    console.log(`📊 Found ${unreadMessages.length} unread messages`);
    
    // Test get messages by room
    const roomId = 'user_hindayeuh1024_gmail_com_admin';
    const roomMessages = await getMessagesByRoom(roomId);
    console.log(`📜 Found ${roomMessages.length} messages in room ${roomId}`);
    
    res.json({
      success: true,
      data: {
        unreadCount: unreadMessages.length,
        unreadMessages: unreadMessages.map(msg => msg.toJSON()),
        roomMessagesCount: roomMessages.length,
        roomMessages: roomMessages.map(msg => msg.toJSON())
      }
    });
  } catch (error) {
    console.error('❌ Test chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test chat messages',
      error: error.message
    });
  }
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

// Import auth controller for database operations
const AuthController = require('./controllers/auth.controller.js');

// Basic auth routes - Using AuthController for phpMyAdmin integration
app.post("/api/auth/login", AuthController.login);
app.post("/api/auth/register", AuthController.register);
app.post("/api/auth/logout", AuthController.logout);
app.get("/api/auth/me", AuthController.getMe);

// Test endpoint to check database schema
app.get("/api/test/schema", async (req, res) => {
  try {
    const { sequelize } = require('./config/database-mysql.config.js');
    const [results] = await sequelize.query("DESCRIBE users");
    
    res.json({
      success: true,
      message: 'Database schema',
      data: results
    });
  } catch (error) {
    console.error('Schema test error:', error);
    res.status(500).json({
      success: false,
      message: 'Schema test failed',
      error: error.message
    });
  }
});

// Test endpoint to check database users
app.get("/api/test/users", async (req, res) => {
  try {
    await initUser();
    const users = await getAllUsers();
    console.log('Found users:', users.length);
    
    res.json({
      success: true,
      message: 'Test users endpoint',
      data: {
        count: users.length,
        users: users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role,
          created_at: u.created_at
        }))
      }
    });
  } catch (error) {
    console.error('Test users error:', error);
    res.status(500).json({
      success: false,
      message: 'Test failed',
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

// Shop Products CRUD endpoints

// Get all shop products
app.get("/api/shop-products", async (req, res) => {
  try {
    await initShopProduct();
    const filters = {
      category: req.query.category,
      status: req.query.status || 'active',
      search: req.query.search
    };
    
    const products = await getAllShopProducts(filters);
    
    res.json({
      success: true,
      message: 'Shop products retrieved successfully',
      data: {
        products: products.map(product => ({
          id: product.id,
          title: product.title,
          description: product.description,
          imageSrc: product.image_src,
          price: product.price,
          deliveryTime: product.delivery_time,
          serviceCategory: product.service_category,
          status: product.status,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        })),
        count: products.length
      }
    });
  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop products',
      error: error.message
    });
  }
});

// Get shop product by ID
app.get("/api/shop-products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await initShopProduct();
    
    const product = await getShopProductById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Shop product not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Shop product retrieved successfully',
      data: {
        product: {
          id: product.id,
          title: product.title,
          description: product.description,
          imageSrc: product.image_src,
          price: product.price,
          deliveryTime: product.delivery_time,
          serviceCategory: product.service_category,
          status: product.status,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Error fetching shop product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop product',
      error: error.message
    });
  }
});

// Create shop product
app.post("/api/shop-products", async (req, res) => {
  try {
    const productData = {
      title: req.body.title,
      description: req.body.description,
      image_src: req.body.imageSrc || '/bg-shopCards.jpg',
      price: req.body.price,
      delivery_time: req.body.deliveryTime,
      service_category: req.body.serviceCategory,
      status: req.body.status || 'active'
    };
    
    await initShopProduct();
    const product = await createShopProduct(productData);
    console.log('✅ New shop product created:', product.toJSON());
    
    res.status(201).json({
      success: true,
      message: 'Shop product created successfully',
      data: {
        product: {
          id: product.id,
          title: product.title,
          description: product.description,
          imageSrc: product.image_src,
          price: product.price,
          deliveryTime: product.delivery_time,
          serviceCategory: product.service_category,
          status: product.status,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Error creating shop product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shop product',
      error: error.message
    });
  }
});

// Update shop product
app.put("/api/shop-products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      image_src: req.body.imageSrc,
      price: req.body.price,
      delivery_time: req.body.deliveryTime,
      service_category: req.body.serviceCategory,
      status: req.body.status
    };
    
    await initShopProduct();
    const product = await updateShopProduct(id, updateData);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Shop product not found'
      });
    }
    
    console.log('✅ Shop product updated:', product.toJSON());
    
    res.json({
      success: true,
      message: 'Shop product updated successfully',
      data: {
        product: {
          id: product.id,
          title: product.title,
          description: product.description,
          imageSrc: product.image_src,
          price: product.price,
          deliveryTime: product.delivery_time,
          serviceCategory: product.service_category,
          status: product.status,
          createdAt: product.created_at,
          updatedAt: product.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Error updating shop product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shop product',
      error: error.message
    });
  }
});

// Delete shop product
app.delete("/api/shop-products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await initShopProduct();
    
    const deleted = await deleteShopProduct(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Shop product not found'
      });
    }
    
    console.log('✅ Shop product deleted:', id);
    
    res.json({
      success: true,
      message: 'Shop product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting shop product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete shop product',
      error: error.message
    });
  }
});

// Get shop product categories
app.get("/api/shop-products/categories", async (req, res) => {
  try {
    await initShopProduct();
    const categories = await getShopProductCategories();
    
    res.json({
      success: true,
      message: 'Shop product categories retrieved successfully',
      data: {
        categories
      }
    });
  } catch (error) {
    console.error('Error fetching shop product categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop product categories',
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

// Portfolio CRUD endpoints - Temporarily disabled
/*
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
*/

// Portfolio endpoints - Temporarily disabled
/*
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
*/

// Blog Articles CRUD API - Temporarily disabled
/*
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
*/

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
    failureRedirect: '/api/auth/google/failure',
    session: false,
    failureMessage: 'Google OAuth authentication failed'
  }),
  (req, res) => {
    try {
      // Successful authentication with REAL Google
      const user = req.user;
      
      console.log('Google OAuth callback successful:', { user });
      
      // Generate proper JWT token
      const token = generateToken(user);
      
      // Redirect to React frontend callback route (existing handler)
      const redirectUrl = `http://localhost:5173/auth/callback?token=${token}&auth=success&login_page=aichatbot`;
      console.log('Redirecting to React auth callback:', redirectUrl);
      console.log('Generated token:', token.substring(0, 50) + '...');
      console.log('User data:', { id: user.id, email: user.email, name: user.displayName });
      return res.redirect(redirectUrl);
      
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Google OAuth callback failed',
        error: error.message || 'Unknown error'
      });
    }
  }
);

// Google OAuth failure handler
app.get('/api/auth/google/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Google OAuth authentication failed',
    error: 'User denied access or authentication failed'
  });
});

// Get current user info (compatible with Google OAuth)
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.cookies?.token || req.headers?.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_jwt_secret');
    
    // Try to find user in database
    let user = null;
    try {
      user = await User.findByPk(decoded.id);
    } catch (error) {
      console.log('Database lookup failed, using token data');
    }
    
    // If user not found in database, use token data
    if (!user) {
      user = {
        id: decoded.id,
        email: decoded.email,
        username: decoded.email?.split('@')[0] || 'user',
        displayName: decoded.email?.split('@')[0] || 'User'
      };
    } else {
      user = {
        id: user.id,
        email: user.email,
        username: user.username || user.email?.split('@')[0],
        displayName: user.displayName || user.username
      };
    }

    res.json({
      success: true,
      message: 'User retrieved successfully',
      data: {
        user: user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: error.message
    });
  }
});

// Default route redirect to login
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Payment routes
const paymentRoutes = require('./routes/payment.routes.js');
app.use('/api/payments', paymentRoutes);

// Admin transactions routes
const adminTransactionsRoutes = require('./routes/admin-transactions.routes.js');
app.use('/api/admin/transactions', adminTransactionsRoutes);

// Travel journal routes - Temporarily disabled
// const travelJournalRoutes = require('./routes/travel-journal.routes.js');
// app.use('/api/travel-journal', travelJournalRoutes);

// AI Chatbot routes
const aiChatbotRoutes = require('./routes/ai-chatbot.routes.js');
app.use('/api/ai-chatbot', aiChatbotRoutes);

// Enhanced AI Chatbot routes
const enhancedAIChatbotRoutes = require('./routes/enhanced-ai-chatbot.routes.js');
app.use('/api/enhanced-ai-chatbot', enhancedAIChatbotRoutes);

// Certification routes
const adminRoutes = require('./routes/admin.routes.js');
const socketChatRoutes = require('./routes/socket-chat.routes.js');
const certificationRoutes = require('./routes/certification.routes.js');
const experienceRoutes = require('./routes/experience.routes.js');
app.use('/api/admin', adminRoutes);
app.use('/api/socket/chat', socketChatRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/experiences', experienceRoutes);

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
            "GET /api/admin/users/:id": "Get user by ID",
            "GET /api/chat/history": "Get chat history",
            "GET /api/chat/unread-count": "Get unread messages count",
            "GET /api/ai-chatbot/health": "AI chatbot health check",
            "POST /api/ai-chatbot/chat": "AI chatbot chat endpoint",
            "GET /api/ai-chatbot/history": "Get AI chatbot history",
            "GET /api/ai-chatbot/suggestions": "Get AI chatbot suggestions",
            "GET /api/travel-journal": "Get all travel journals",
            "POST /api/travel-journal": "Create travel journal",
            "GET /api/travel-journal/:id": "Get travel journal by ID",
            "PUT /api/travel-journal/:id": "Update travel journal",
            "DELETE /api/travel-journal/:id": "Delete travel journal"
        }
    });
});

// Chat API routes
console.log('🔧 Registering chat routes...');
app.get('/api/chat/history', (req, res) => {
  console.log('📝 Chat history route called');
  SocketChatController.getChatHistory(req, res);
});
app.get('/api/chat/unread-count', (req, res) => {
  console.log('📊 Unread count route called');
  SocketChatController.getUnreadCount(req, res);
});
console.log('✅ Chat routes registered successfully');

// Admin Chat History API routes
const AdminChatHistoryController = require('./controllers/admin-chat-history.controller.js');
console.log('🔧 Registering admin chat history routes...');

// Get admin chat history with filters
app.get('/api/admin/chat-history', AdminChatHistoryController.getAdminChatHistory);

// Get chat session by room ID
app.get('/api/admin/chat-history/session/:roomId', AdminChatHistoryController.getChatSession);

// Update chat session
app.put('/api/admin/chat-history/session/:roomId', AdminChatHistoryController.updateChatSession);

// Mark chat as resolved
app.put('/api/admin/chat-history/resolve/:messageId', AdminChatHistoryController.markChatAsResolved);

// Get admin chat statistics
app.get('/api/admin/chat-history/stats', AdminChatHistoryController.getAdminChatStats);

// Get chat by date range
app.get('/api/admin/chat-history/date-range', AdminChatHistoryController.getChatByDateRange);

// Get chat categories
app.get('/api/admin/chat-history/categories', AdminChatHistoryController.getChatCategories);

// Export chat history
app.get('/api/admin/chat-history/export', AdminChatHistoryController.exportChatHistory);

// Create admin chat history entry
app.post('/api/admin/chat-history', AdminChatHistoryController.createAdminChatHistory);

console.log('✅ Admin chat history routes registered successfully');

const PORT = process.env.PORT || 55432;

// Initialize database and start server
if (require.main === module) {
  // Initialize database first
  const { initializeDatabase } = require('./config/database.config.js');
  const { initUser } = require('./models/User.model.js');
  const { initChatMessage } = require('./models/ChatMessage.model.js');
  const { initAdminChatHistory } = require('./models/AdminChatHistory.model.js');
  
  initializeDatabase()
    .then(() => {
      console.log('✅ Database initialized successfully');
      
      // Initialize User model
      return initUser();
    })
    .then(() => {
      console.log('✅ User model synchronized');
      
      // Initialize ChatMessage model
      return initChatMessage();
    })
    .then(() => {
      console.log('✅ ChatMessage model synchronized');
      
      // Initialize AdminChatHistory model
      return initAdminChatHistory();
    })
    .then(() => {
      console.log('✅ AdminChatHistory model synchronized');
      
      // Initialize Socket.IO
      SocketChatController.initializeSocket(io);
      console.log('✅ Socket.IO initialized');
      
      // Start server with Socket.IO
      server.listen(PORT, () => {
        console.log(`🚀 Travello API Server running on http://localhost:${PORT}`);
        console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
        console.log(`📋 API Info: http://localhost:${PORT}/api`);
        console.log(`💬 Socket.IO Chat: ws://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error('❌ Database initialization failed:', error.message);
      console.log('⚠️  Starting server without database connection...');
      
      // Initialize Socket.IO anyway
      SocketChatController.initializeSocket(io);
      console.log('✅ Socket.IO initialized (without database)');
      
      // Start server anyway
      server.listen(PORT, () => {
        console.log(`🚀 Travello API Server running on http://localhost:${PORT} (without database)`);
        console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api-docs`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
        console.log(`📋 API Info: http://localhost:${PORT}/api`);
        console.log(`💬 Socket.IO Chat: ws://localhost:${PORT}`);
        console.log('⚠️  Database features disabled');
      });
    });
}

module.exports = app;

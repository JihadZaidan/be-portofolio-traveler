const express = require('express');
const cors = require('cors');
const { sequelize, testConnection, initializeDatabase } = require('./database-config');
const { 
  ShopProduct, 
  initShopProduct, 
  createShopProduct, 
  getAllShopProducts, 
  getShopProductById, 
  updateShopProduct, 
  deleteShopProduct, 
  getShopProductCategories 
} = require('./src/models/ShopProducts.model.mysql.js');

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
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

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// Initialize database and models
const initializeApp = async () => {
  try {
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Failed to connect to database. Please check your MySQL configuration.');
      process.exit(1);
    }

    // Initialize models
    await initShopProduct();
    
    // Initialize database tables
    await initializeDatabase();
    
    console.log('✅ Application initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
};

// Get all shops (public endpoint)
app.get("/api/shops", async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.category) {
      filters.category = req.query.category;
    }
    
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    if (req.query.search) {
      const { Op } = require('sequelize');
      filters[Op.or] = [
        { name: { [Op.like]: `%${req.query.search}%` } },
        { description: { [Op.like]: `%${req.query.search}%` } }
      ];
    }
    
    const allShops = await getAllShopProducts(filters);
    
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
    const shop = await getShopProductById(id);
    
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
    
    const newShop = await createShopProduct(shopData);
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
    
    const updatedShop = await updateShopProduct(id, updateData);
    
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
    
    const deleted = await deleteShopProduct(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    console.log('✅ Shop deleted successfully');
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
    const categories = await getShopProductCategories();
    
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

// Start server
const PORT = process.env.PORT || 5000;

// Initialize and start server
initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Travello Server with Database running on port ${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🛍️ Shops API: http://localhost:${PORT}/api/shops`);
    console.log(`📊 Shop Categories: http://localhost:${PORT}/api/shops/categories`);
    console.log(`🗄️ Database: MySQL`);
  });
}).catch(error => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

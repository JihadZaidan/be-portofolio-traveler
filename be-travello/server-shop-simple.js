const express = require('express');
const cors = require('cors');
const { testConnection, initializeDatabase } = require('./database-config-simple.js');
const { 
  initShopProduct, 
  createShopProduct, 
  getAllShopProducts, 
  getShopProductById, 
  updateShopProduct, 
  deleteShopProduct 
} = require('./src/models/ShopProducts.simple.js');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Shop API Server is running',
    timestamp: new Date().toISOString()
  });
});

// Get all shops
app.get('/api/shops', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      category: req.query.category,
      search: req.query.search
    };
    
    const shops = await getAllShopProducts(filters);
    
    res.json({
      success: true,
      message: 'Shops retrieved successfully',
      data: {
        shops: shops,
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
app.get('/api/shops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await getShopProductById(id);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Shop retrieved successfully',
      data: { shop }
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
app.post('/api/shops', async (req, res) => {
  try {
    const shopData = req.body;
    console.log('📝 Creating shop with data:', shopData);
    
    const shop = await createShopProduct(shopData);
    console.log('✅ Shop created successfully:', shop.toJSON());
    
    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: { shop: shop.toJSON() }
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
app.put('/api/shops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log('📝 Updating shop:', id, 'with data:', updateData);
    
    const shop = await updateShopProduct(id, updateData);
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    console.log('✅ Shop updated successfully:', shop.toJSON());
    
    res.json({
      success: true,
      message: 'Shop updated successfully',
      data: { shop: shop.toJSON() }
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
app.delete('/api/shops/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await deleteShopProduct(id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    console.log('✅ Shop deleted successfully:', id);
    
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

// Start server
const startServer = async () => {
  try {
    console.log('🔄 Testing database connection...');
    const connected = await testConnection();
    
    if (!connected) {
      console.error('❌ Failed to connect to database. Please ensure MySQL is running and database exists.');
      process.exit(1);
    }
    
    console.log('🔄 Initializing database...');
    await initializeDatabase();
    
    console.log('🔄 Initializing ShopProduct model...');
    await initShopProduct();
    
    app.listen(PORT, () => {
      console.log('🚀 Shop API Server running successfully!');
      console.log(`📍 Local: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🛍️  Shops API: http://localhost:${PORT}/api/shops`);
      console.log('✅ Server is ready to handle requests!');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

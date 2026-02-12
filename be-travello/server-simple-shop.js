const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// File-based storage for products
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Initialize products file if it doesn't exist
const initializeProductsFile = () => {
  if (!fs.existsSync(PRODUCTS_FILE)) {
    const initialProducts = [
      {
        id: 1,
        title: 'I will be SEO content writer for article writing or blog writing',
        description: 'Professional SEO content writing service with 7 years of experience.',
        image_src: '/bg-shopCards.jpg',
        price: 20.00,
        delivery_time: '2 Days Delivery',
        service_category: 'SEO Content',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        title: 'I will write human SEO blogs and articles',
        description: 'Human-written SEO blogs and articles that rank well and engage readers.',
        image_src: '/bg-shopCards.jpg',
        price: 100.00,
        delivery_time: '3 Days Delivery',
        service_category: 'Blog Writing',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        title: 'I will write SEO blog posts and articles as your content writer',
        description: 'Expert SEO blog posts and articles with keyword research and optimization.',
        image_src: '/bg-shopCards.jpg',
        price: 100.00,
        delivery_time: '7 Days Delivery',
        service_category: 'Product Description',
        status: 'inactive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(initialProducts, null, 2));
    console.log('✅ Products file initialized with sample data');
  }
};

// Helper functions
const readProducts = () => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
};

const writeProducts = (products) => {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing products:', error);
    return false;
  }
};

const getNextId = () => {
  const products = readProducts();
  const maxId = Math.max(...products.map(p => p.id), 0);
  return maxId + 1;
};

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

// Get all shops (public endpoint)
app.get("/api/shops", async (req, res) => {
  try {
    const products = readProducts();
    
    // Apply filters
    let filteredProducts = products;
    
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(p => p.service_category === req.query.category);
    }
    
    if (req.query.status) {
      filteredProducts = filteredProducts.filter(p => p.status === req.query.status);
    }
    
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm) ||
        p.service_category.toLowerCase().includes(searchTerm)
      );
    }
    
    console.log(`📊 Fetching ${filteredProducts.length} shops for frontend`);
    res.json(filteredProducts);
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
    const products = readProducts();
    const shop = products.find(p => p.id === parseInt(id));
    
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
    const products = readProducts();
    
    console.log('🛍️ Creating new shop:', shopData);
    
    const newShop = {
      id: getNextId(),
      ...shopData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    products.push(newShop);
    
    if (writeProducts(products)) {
      console.log('✅ New shop created:', newShop);
      res.status(201).json(newShop);
    } else {
      throw new Error('Failed to save product');
    }
  } catch (error) {
    console.error('❌ Error creating shop:', error);
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
    const products = readProducts();
    
    console.log('🔄 Updating shop:', id, updateData);
    
    const index = products.findIndex(p => p.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    products[index] = {
      ...products[index],
      ...updateData,
      updated_at: new Date().toISOString()
    };
    
    if (writeProducts(products)) {
      console.log('✅ Shop updated:', products[index]);
      res.json(products[index]);
    } else {
      throw new Error('Failed to update product');
    }
  } catch (error) {
    console.error('❌ Error updating shop:', error);
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
    const products = readProducts();
    
    console.log('🗑️ Deleting shop:', id);
    
    const index = products.findIndex(p => p.id === parseInt(id));
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }
    
    const deletedShop = products.splice(index, 1)[0];
    
    if (writeProducts(products)) {
      console.log('✅ Shop deleted successfully');
      res.json({ success: true, message: 'Shop deleted successfully' });
    } else {
      throw new Error('Failed to delete product');
    }
  } catch (error) {
    console.error('❌ Error deleting shop:', error);
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
    const products = readProducts();
    const categories = [...new Set(products.map(p => p.service_category).filter(Boolean))];
    
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

// Initialize and start server
const PORT = process.env.PORT || 5001;

// Initialize products file
initializeProductsFile();

app.listen(PORT, () => {
  console.log(`🚀 Travello Shop Server (File-based) running on port ${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`🛍️ Shops API: http://localhost:${PORT}/api/shops`);
  console.log(`📊 Shop Categories: http://localhost:${PORT}/api/shops/categories`);
  console.log(`🗄️ Storage: File-based (products.json)`);
  console.log(`📝 Admin shop should now work without database errors!`);
});

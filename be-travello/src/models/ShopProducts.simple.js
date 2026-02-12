const { DataTypes } = require('sequelize');
const { sequelize } = require('../../database-config-simple.js');

const ShopProduct = sequelize.define('ShopProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_src: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: '/bg-shopCards.jpg'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  delivery_time: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  service_category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'shop_products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Initialize model
const initShopProduct = async () => {
  try {
    await ShopProduct.sync({ force: true }); // Force recreate table
    console.log('✅ ShopProduct table created successfully');
    
    // Insert sample data
    await ShopProduct.bulkCreate([
      {
        title: 'I will be SEO content writer for article writing or blog writing',
        description: 'Professional SEO content writing service with 7 years of experience',
        image_src: '/bg-shopCards.jpg',
        price: 20.00,
        delivery_time: '2 Days Delivery',
        service_category: 'SEO Content',
        status: 'active'
      },
      {
        title: 'I will write human SEO blogs and articles',
        description: 'Human-written SEO blogs and articles that rank well and engage readers',
        image_src: '/bg-shopCards.jpg',
        price: 100.00,
        delivery_time: '3 Days Delivery',
        service_category: 'Blog Writing',
        status: 'active'
      }
    ]);
    console.log('✅ Sample shop products inserted');
    
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize ShopProduct:', error.message);
    throw error;
  }
};

// Create new product
const createShopProduct = async (productData) => {
  try {
    const product = await ShopProduct.create(productData);
    return product;
  } catch (error) {
    console.error('❌ Error creating shop product:', error.message);
    throw error;
  }
};

// Get all products
const getAllShopProducts = async (filters = {}) => {
  try {
    const whereClause = {};
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.category) {
      whereClause.service_category = filters.category;
    }
    
    if (filters.search) {
      const { Op } = require('sequelize');
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
        { service_category: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    const products = await ShopProduct.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
    
    return products;
  } catch (error) {
    console.error('❌ Error getting all shop products:', error.message);
    throw error;
  }
};

// Get product by ID
const getShopProductById = async (id) => {
  try {
    const product = await ShopProduct.findByPk(id);
    return product;
  } catch (error) {
    console.error('❌ Error getting shop product by ID:', error.message);
    throw error;
  }
};

// Update product
const updateShopProduct = async (id, updateData) => {
  try {
    const [updatedRowsCount] = await ShopProduct.update(updateData, { 
      where: { id }
    });
    
    if (updatedRowsCount > 0) {
      return await getShopProductById(id);
    }
    return null;
  } catch (error) {
    console.error('❌ Error updating shop product:', error.message);
    throw error;
  }
};

// Delete product
const deleteShopProduct = async (id) => {
  try {
    const deletedRowsCount = await ShopProduct.destroy({ where: { id } });
    return deletedRowsCount > 0;
  } catch (error) {
    console.error('❌ Error deleting shop product:', error.message);
    throw error;
  }
};

module.exports = {
  ShopProduct,
  initShopProduct,
  createShopProduct,
  getAllShopProducts,
  getShopProductById,
  updateShopProduct,
  deleteShopProduct
};

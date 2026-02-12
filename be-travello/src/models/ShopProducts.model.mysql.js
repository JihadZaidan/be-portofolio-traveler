const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database-mysql.config.js');

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
    defaultValue: '/bg-shopCards.jpg',
    field: 'image_src'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  delivery_time: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'delivery_time'
  },
  service_category: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'service_category'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
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
    await ShopProduct.sync({ alter: true });
    console.log('✅ ShopProduct model initialized');
  } catch (error) {
    console.error('❌ Failed to initialize ShopProduct model:', error);
    throw error;
  }
};

// Create new product
const createShopProduct = async (productData) => {
  try {
    const product = await ShopProduct.create(productData);
    return product;
  } catch (error) {
    console.error('❌ Error creating shop product:', error);
    throw error;
  }
};

// Get all products
const getAllShopProducts = async (filters = {}) => {
  try {
    const whereClause = {};
    
    if (filters.category) {
      whereClause.service_category = filters.category;
    }
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.search) {
      const { Op } = DataTypes;
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
    console.error('❌ Error getting all shop products:', error);
    throw error;
  }
};

// Get product by ID
const getShopProductById = async (id) => {
  try {
    const product = await ShopProduct.findByPk(id);
    return product;
  } catch (error) {
    console.error('❌ Error getting shop product by ID:', error);
    throw error;
  }
};

// Update product
const updateShopProduct = async (id, updateData) => {
  try {
    const [updatedRowsCount] = await ShopProduct.update(updateData, { 
      where: { id },
      returning: true
    });
    
    if (updatedRowsCount > 0) {
      return await getShopProductById(id);
    }
    return null;
  } catch (error) {
    console.error('❌ Error updating shop product:', error);
    throw error;
  }
};

// Delete product
const deleteShopProduct = async (id) => {
  try {
    const deletedRowsCount = await ShopProduct.destroy({ where: { id } });
    return deletedRowsCount > 0;
  } catch (error) {
    console.error('❌ Error deleting shop product:', error);
    throw error;
  }
};

// Get product categories
const getShopProductCategories = async () => {
  try {
    const categories = await ShopProduct.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('service_category')), 'service_category']],
      order: [['service_category', 'ASC']]
    });
    return categories.map(item => item.service_category).filter(Boolean);
  } catch (error) {
    console.error('❌ Error getting shop product categories:', error);
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
  deleteShopProduct,
  getShopProductCategories
};

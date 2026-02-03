const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-mysql.config.js');

const Shop = sequelize.define('Shop', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'image_url'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: 0.00
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  contact: {
    type: DataTypes.STRING,
    allowNull: true
  },
  website: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending'),
    allowNull: false,
    defaultValue: 'active'
  },
  createdBy: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'shops',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Initialize model
const initShop = async () => {
  try {
    await Shop.sync({ alter: true });
    console.log('✅ Shop model initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Shop model:', error);
    throw error;
  }
};

// Create new shop
const createShop = async (shopData) => {
  try {
    const shop = await Shop.create(shopData);
    return shop;
  } catch (error) {
    console.error('❌ Error creating shop:', error);
    throw error;
  }
};

// Get all shops
const getAllShops = async (filters = {}) => {
  try {
    const whereClause = {};
    
    if (filters.category) {
      whereClause.category = filters.category;
    }
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.search) {
      const { Op } = DataTypes;
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
        { location: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    const shops = await Shop.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']],
      include: filters.includeUser ? [{
        model: require('./User.model.mysql.js').User,
        attributes: ['id', 'username', 'email', 'displayName']
      }] : undefined
    });
    
    return shops;
  } catch (error) {
    console.error('❌ Error getting all shops:', error);
    throw error;
  }
};

// Get shop by ID
const getShopById = async (id) => {
  try {
    const shop = await Shop.findByPk(id, {
      include: [{
        model: require('./User.model.mysql.js').User,
        attributes: ['id', 'username', 'email', 'displayName']
      }]
    });
    return shop;
  } catch (error) {
    console.error('❌ Error getting shop by ID:', error);
    throw error;
  }
};

// Update shop
const updateShop = async (id, updateData) => {
  try {
    const [updatedRowsCount] = await Shop.update(updateData, { 
      where: { id },
      returning: true
    });
    
    if (updatedRowsCount > 0) {
      return await getShopById(id);
    }
    return null;
  } catch (error) {
    console.error('❌ Error updating shop:', error);
    throw error;
  }
};

// Delete shop
const deleteShop = async (id) => {
  try {
    const deletedRowsCount = await Shop.destroy({ where: { id } });
    return deletedRowsCount > 0;
  } catch (error) {
    console.error('❌ Error deleting shop:', error);
    throw error;
  }
};

// Get shops by user
const getShopsByUser = async (userId) => {
  try {
    const shops = await Shop.findAll({
      where: { createdBy: userId },
      order: [['created_at', 'DESC']]
    });
    return shops;
  } catch (error) {
    console.error('❌ Error getting shops by user:', error);
    throw error;
  }
};

// Get shop categories
const getShopCategories = async () => {
  try {
    const categories = await Shop.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    });
    return categories.map(item => item.category);
  } catch (error) {
    console.error('❌ Error getting shop categories:', error);
    throw error;
  }
};

module.exports = {
  Shop,
  initShop,
  createShop,
  getAllShops,
  getShopById,
  updateShop,
  deleteShop,
  getShopsByUser,
  getShopCategories
};

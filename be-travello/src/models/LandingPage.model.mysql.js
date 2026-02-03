const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-mysql.config.js');

const LandingPage = sequelize.define('LandingPage', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `landing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  section: {
    type: DataTypes.ENUM('hero', 'about', 'services', 'portfolio', 'testimonials', 'contact', 'footer'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subtitle: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'image_url'
  },
  buttonText: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'button_text'
  },
  buttonLink: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'button_link'
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'order_index'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
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
  tableName: 'landing_pages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Initialize model
const initLandingPage = async () => {
  try {
    await LandingPage.sync({ alter: true });
    console.log('✅ LandingPage model initialized');
  } catch (error) {
    console.error('❌ Failed to initialize LandingPage model:', error);
    throw error;
  }
};

// Create new landing page content
const createLandingPage = async (pageData) => {
  try {
    const page = await LandingPage.create(pageData);
    return page;
  } catch (error) {
    console.error('❌ Error creating landing page:', error);
    throw error;
  }
};

// Get all landing pages
const getAllLandingPages = async (filters = {}) => {
  try {
    const whereClause = {};
    
    if (filters.section) {
      whereClause.section = filters.section;
    }
    
    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }
    
    const pages = await LandingPage.findAll({
      where: whereClause,
      order: [['order_index', 'ASC'], ['created_at', 'DESC']],
      include: filters.includeUser ? [{
        model: require('./User.model.mysql.js').User,
        attributes: ['id', 'username', 'email', 'displayName']
      }] : undefined
    });
    
    return pages;
  } catch (error) {
    console.error('❌ Error getting all landing pages:', error);
    throw error;
  }
};

// Get landing page by ID
const getLandingPageById = async (id) => {
  try {
    const page = await LandingPage.findByPk(id, {
      include: [{
        model: require('./User.model.mysql.js').User,
        attributes: ['id', 'username', 'email', 'displayName']
      }]
    });
    return page;
  } catch (error) {
    console.error('❌ Error getting landing page by ID:', error);
    throw error;
  }
};

// Update landing page
const updateLandingPage = async (id, updateData) => {
  try {
    const [updatedRowsCount] = await LandingPage.update(updateData, { 
      where: { id },
      returning: true
    });
    
    if (updatedRowsCount > 0) {
      return await getLandingPageById(id);
    }
    return null;
  } catch (error) {
    console.error('❌ Error updating landing page:', error);
    throw error;
  }
};

// Delete landing page
const deleteLandingPage = async (id) => {
  try {
    const deletedRowsCount = await LandingPage.destroy({ where: { id } });
    return deletedRowsCount > 0;
  } catch (error) {
    console.error('❌ Error deleting landing page:', error);
    throw error;
  }
};

// Get landing pages by section
const getLandingPagesBySection = async (section) => {
  try {
    const pages = await LandingPage.findAll({
      where: { section, isActive: true },
      order: [['order_index', 'ASC']]
    });
    return pages;
  } catch (error) {
    console.error('❌ Error getting landing pages by section:', error);
    throw error;
  }
};

module.exports = {
  LandingPage,
  initLandingPage,
  createLandingPage,
  getAllLandingPages,
  getLandingPageById,
  updateLandingPage,
  deleteLandingPage,
  getLandingPagesBySection
};

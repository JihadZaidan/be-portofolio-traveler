import { DataTypes } from 'sequelize';
import sequelize from '../config/database-mysql.config.js';

const Portfolio = sequelize.define('Portfolio', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('web', 'mobile', 'design', 'photography', 'video', 'other'),
    allowNull: false,
    defaultValue: 'web'
  },
  imageUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'image_url'
  },
  thumbnailUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'thumbnail_url'
  },
  projectUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'project_url'
  },
  githubUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'github_url'
  },
  technologies: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  published: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'order_index'
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'client_name'
  },
  completionDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'completion_date'
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
  tableName: 'portfolios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Initialize model
export const initPortfolio = async () => {
  try {
    await Portfolio.sync({ alter: true });
    console.log('✅ Portfolio model initialized');
  } catch (error) {
    console.error('❌ Failed to initialize Portfolio model:', error);
    throw error;
  }
};

// Create new portfolio
export const createPortfolio = async (portfolioData) => {
  try {
    const portfolio = await Portfolio.create(portfolioData);
    return portfolio;
  } catch (error) {
    console.error('❌ Error creating portfolio:', error);
    throw error;
  }
};

// Get all portfolios
export const getAllPortfolios = async (filters = {}) => {
  try {
    const whereClause = {};
    
    if (filters.category) {
      whereClause.category = filters.category;
    }
    
    if (filters.featured !== undefined) {
      whereClause.featured = filters.featured;
    }
    
    if (filters.published !== undefined) {
      whereClause.published = filters.published;
    }
    
    if (filters.search) {
      const { Op } = DataTypes;
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
        { clientName: { [Op.like]: `%${filters.search}%` } }
      ];
    }
    
    const portfolios = await Portfolio.findAll({
      where: whereClause,
      order: [['order_index', 'ASC'], ['created_at', 'DESC']],
      include: filters.includeUser ? [{
        model: (await import('./User.model.mysql.js')).default,
        attributes: ['id', 'username', 'email', 'displayName']
      }] : undefined
    });
    
    return portfolios;
  } catch (error) {
    console.error('❌ Error getting all portfolios:', error);
    throw error;
  }
};

// Get portfolio by ID
export const getPortfolioById = async (id) => {
  try {
    const portfolio = await Portfolio.findByPk(id, {
      include: [{
        model: (await import('./User.model.mysql.js')).default,
        attributes: ['id', 'username', 'email', 'displayName']
      }]
    });
    return portfolio;
  } catch (error) {
    console.error('❌ Error getting portfolio by ID:', error);
    throw error;
  }
};

// Update portfolio
export const updatePortfolio = async (id, updateData) => {
  try {
    const [updatedRowsCount] = await Portfolio.update(updateData, { 
      where: { id },
      returning: true
    });
    
    if (updatedRowsCount > 0) {
      return await getPortfolioById(id);
    }
    return null;
  } catch (error) {
    console.error('❌ Error updating portfolio:', error);
    throw error;
  }
};

// Delete portfolio
export const deletePortfolio = async (id) => {
  try {
    const deletedRowsCount = await Portfolio.destroy({ where: { id } });
    return deletedRowsCount > 0;
  } catch (error) {
    console.error('❌ Error deleting portfolio:', error);
    throw error;
  }
};

// Get featured portfolios
export const getFeaturedPortfolios = async (limit = 6) => {
  try {
    const portfolios = await Portfolio.findAll({
      where: { featured: true, published: true },
      order: [['order_index', 'ASC'], ['created_at', 'DESC']],
      limit
    });
    return portfolios;
  } catch (error) {
    console.error('❌ Error getting featured portfolios:', error);
    throw error;
  }
};

// Get portfolios by category
export const getPortfoliosByCategory = async (category) => {
  try {
    const portfolios = await Portfolio.findAll({
      where: { category, published: true },
      order: [['order_index', 'ASC'], ['created_at', 'DESC']]
    });
    return portfolios;
  } catch (error) {
    console.error('❌ Error getting portfolios by category:', error);
    throw error;
  }
};

// Get portfolio categories
export const getPortfolioCategories = async () => {
  try {
    const categories = await Portfolio.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    });
    return categories.map(item => item.category);
  } catch (error) {
    console.error('❌ Error getting portfolio categories:', error);
    throw error;
  }
};

export default Portfolio;

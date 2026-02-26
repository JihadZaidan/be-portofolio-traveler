const { DataTypes } = require('sequelize');
const sequelize = require('../config/database-mysql.config.js');

const BlogArticle = sequelize.define('BlogArticle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  imageSrc: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null,
    field: 'imageSrc'
  },
  cover: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: null
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Uncategorized',
    validate: {
      len: [1, 100]
    }
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Admin',
    validate: {
      len: [1, 100]
    }
  },
  date: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: null
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    defaultValue: null
  },
  status: {
    type: DataTypes.ENUM('publish', 'draft'),
    allowNull: false,
    defaultValue: 'draft',
    validate: {
      isIn: [['publish', 'draft']]
    }
  },
  authorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: null,
    field: 'author_id'
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  metaTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    field: 'meta_title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null,
    field: 'meta_description'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'view_count'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
    field: 'published_at'
  }
}, {
  tableName: 'blog_articles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: (article) => {
      if (!article.slug || article.slug === '') {
        article.slug = generateSlug(article.title);
      }
      if (article.status === 'publish' && !article.publishedAt) {
        article.publishedAt = new Date();
      }
      if (!article.description || article.description === '') {
        article.description = generateDescription(article.content);
      }
      if (!article.date || article.date === '') {
        article.date = formatDate(new Date());
      }
      // Ensure imageSrc is set (fallback to cover)
      if (!article.imageSrc && article.cover) {
        article.imageSrc = article.cover;
      }
    },
    beforeUpdate: (article) => {
      if (!article.slug || article.slug === '') {
        article.slug = generateSlug(article.title);
      }
      if (article.status === 'publish' && !article.publishedAt) {
        article.publishedAt = new Date();
      }
      if (article.status === 'draft') {
        article.publishedAt = null;
      }
      if (!article.description || article.description === '') {
        article.description = generateDescription(article.content);
      }
      if (!article.date || article.date === '') {
        article.date = formatDate(new Date());
      }
      // Ensure imageSrc is set (fallback to cover)
      if (!article.imageSrc && article.cover) {
        article.imageSrc = article.cover;
      }
    }
  }
});

// Helper function to generate slug
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Helper function to generate description from content
function generateDescription(content) {
  if (!content) return '';
  const text = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 140 ? `${text.slice(0, 140)}...` : text;
}

// Helper function to format date
function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
}

// CRUD Operations
const createBlogArticle = async (articleData) => {
  try {
    const article = await BlogArticle.create(articleData);
    return article;
  } catch (error) {
    console.error('❌ Error creating blog article:', error);
    throw error;
  }
};

const getAllBlogArticles = async (filters = {}) => {
  try {
    const { status, category, limit = 50, offset = 0 } = filters;
    
    const whereClause = {};
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    
    const articles = await BlogArticle.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    return {
      articles: articles.rows,
      total: articles.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(articles.count / limit)
    };
  } catch (error) {
    console.error('❌ Error fetching blog articles:', error);
    throw error;
  }
};

const getBlogArticleById = async (id) => {
  try {
    const article = await BlogArticle.findByPk(id);
    return article;
  } catch (error) {
    console.error('❌ Error fetching blog article by ID:', error);
    throw error;
  }
};

const getBlogArticleBySlug = async (slug) => {
  try {
    const article = await BlogArticle.findOne({
      where: { slug }
    });
    return article;
  } catch (error) {
    console.error('❌ Error fetching blog article by slug:', error);
    throw error;
  }
};

const updateBlogArticle = async (id, updateData) => {
  try {
    const [updatedRowsCount] = await BlogArticle.update(updateData, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      throw new Error('Blog article not found');
    }
    
    const updatedArticle = await BlogArticle.findByPk(id);
    return updatedArticle;
  } catch (error) {
    console.error('❌ Error updating blog article:', error);
    throw error;
  }
};

const deleteBlogArticle = async (id) => {
  try {
    const deletedRowsCount = await BlogArticle.destroy({
      where: { id }
    });
    
    return deletedRowsCount > 0;
  } catch (error) {
    console.error('❌ Error deleting blog article:', error);
    throw error;
  }
};

const getPublishedArticles = async (filters = {}) => {
  try {
    const { category, limit = 10, offset = 0 } = filters;
    
    const whereClause = { status: 'publish' };
    if (category) whereClause.category = category;
    
    const articles = await BlogArticle.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['published_at', 'DESC']],
      attributes: ['id', 'title', 'slug', 'cover', 'category', 'excerpt', 'view_count', 'published_at', 'created_at']
    });
    
    return {
      articles: articles.rows,
      total: articles.count,
      page: Math.floor(offset / limit) + 1,
      totalPages: Math.ceil(articles.count / limit)
    };
  } catch (error) {
    console.error('❌ Error fetching published articles:', error);
    throw error;
  }
};

const getBlogCategories = async () => {
  try {
    const categories = await BlogArticle.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: {
        status: 'publish'
      }
    });
    
    return categories.map(cat => cat.category);
  } catch (error) {
    console.error('❌ Error fetching blog categories:', error);
    throw error;
  }
};

const incrementViewCount = async (id) => {
  try {
    await BlogArticle.increment('view_count', {
      where: { id }
    });
  } catch (error) {
    console.error('❌ Error incrementing view count:', error);
    throw error;
  }
};

// Initialize database connection
const initBlogArticle = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ BlogArticle database connection established successfully.');
    
    await BlogArticle.sync({ alter: true });
    console.log('✅ BlogArticle table synchronized successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to BlogArticle database:', error);
    throw error;
  }
};

module.exports = {
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
};

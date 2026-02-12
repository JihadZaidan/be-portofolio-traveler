const {
  getAllPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getFeaturedPortfolios,
  getPortfoliosByCategory,
  getPortfolioCategories
} = require('../models/Portfolio.model.mysql.js');

// Get all portfolios with optional filters
const getPortfolios = async (req, res) => {
  try {
    const {
      category,
      featured,
      published,
      search,
      limit,
      page = 1,
      includeUser = 'false'
    } = req.query;

    const filters = {
      category,
      featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
      published: published === 'true' ? true : published === 'false' ? false : undefined,
      search,
      includeUser: includeUser === 'true'
    };

    const portfolios = await getAllPortfolios(filters);
    
    res.status(200).json({
      success: true,
      data: {
        portfolios,
        pagination: {
          page: parseInt(page),
          limit: limit ? parseInt(limit) : portfolios.length,
          total: portfolios.length
        }
      }
    });
  } catch (error) {
    console.error('❌ Error fetching portfolios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios',
      error: error.message
    });
  }
};

// Get portfolio by ID
const getPortfolio = async (req, res) => {
  try {
    const { id } = req.params;
    
    const portfolio = await getPortfolioById(id);
    
    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    res.status(200).json({
      success: true,
      data: portfolio
    });
  } catch (error) {
    console.error('❌ Error fetching portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message
    });
  }
};

// Create new portfolio
const createNewPortfolio = async (req, res) => {
  try {
    console.log('📝 Received portfolio creation request');
    console.log('📊 Request body:', JSON.stringify(req.body, null, 2));
    
    const portfolioData = {
      ...req.body,
      createdBy: req.user?.id || 'admin'
    };

    // Validate required fields
    const requiredFields = ['title', 'description', 'category'];
    const missingFields = requiredFields.filter(field => !portfolioData[field] || portfolioData[field].trim() === '');
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
        error: 'Validation failed'
      });
    }

    console.log('✅ Creating portfolio with data:', JSON.stringify(portfolioData, null, 2));
    const portfolio = await createPortfolio(portfolioData);
    console.log('✅ Portfolio created successfully:', JSON.stringify(portfolio, null, 2));

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: {
        portfolio: portfolio
      }
    });
  } catch (error) {
    console.error('❌ Error creating portfolio:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create portfolio',
      error: error.message
    });
  }
};

// Update portfolio
const updatePortfolioById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Updating portfolio:', id, 'with data:', updateData);
    const portfolio = await updatePortfolio(id, updateData);
    console.log('Portfolio updated successfully:', portfolio);

    if (!portfolio) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Portfolio updated successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('❌ Error updating portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update portfolio',
      error: error.message
    });
  }
};

// Delete portfolio
const deletePortfolioById = async (req, res) => {
  try {
    const { id } = req.params;

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
    console.error('❌ Error deleting portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete portfolio',
      error: error.message
    });
  }
};

// Get featured portfolios
const getFeaturedPortfolioItems = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const portfolios = await getFeaturedPortfolios(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: {
        portfolios,
        count: portfolios.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching featured portfolios:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured portfolios',
      error: error.message
    });
  }
};

// Get portfolios by category
const getPortfolioByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const portfolios = await getPortfoliosByCategory(category);
    
    res.status(200).json({
      success: true,
      data: {
        portfolios,
        count: portfolios.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching portfolios by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolios by category',
      error: error.message
    });
  }
};

// Get portfolio categories
const getPortfolioCategoriesList = async (req, res) => {
  try {
    const categories = await getPortfolioCategories();
    
    res.status(200).json({
      success: true,
      data: {
        categories,
        count: categories.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching portfolio categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio categories',
      error: error.message
    });
  }
};

module.exports = {
  getPortfolios,
  getPortfolio,
  createNewPortfolio,
  updatePortfolioById,
  deletePortfolioById,
  getFeaturedPortfolioItems,
  getPortfolioByCategory,
  getPortfolioCategoriesList
};

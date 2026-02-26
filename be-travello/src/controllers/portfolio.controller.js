import {
  getAllPortfolios,
  getPortfolioById,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getFeaturedPortfolios,
  getPortfoliosByCategory,
  getPortfolioCategories
} from '../models/Portfolio.model.mysql.js';

// Get all portfolios with optional filters
export const getPortfolios = async (req, res) => {
  try {
    const {
      category,
      featured,
      published = 'true',
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
export const getPortfolio = async (req, res) => {
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
export const createNewPortfolio = async (req, res) => {
  try {
    const portfolioData = {
      ...req.body,
      createdBy: req.user?.id || 'admin'
    };

    const portfolio = await createPortfolio(portfolioData);

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      data: portfolio
    });
  } catch (error) {
    console.error('❌ Error creating portfolio:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create portfolio',
      error: error.message
    });
  }
};

// Update portfolio
export const updatePortfolioById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const portfolio = await updatePortfolio(id, updateData);

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
export const deletePortfolioById = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deletePortfolio(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Portfolio not found'
      });
    }

    res.status(200).json({
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
export const getFeaturedPortfolioItems = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const portfolios = await getFeaturedPortfolios(parseInt(limit));

    res.status(200).json({
      success: true,
      data: portfolios
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
export const getPortfolioByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const portfolios = await getPortfoliosByCategory(category);

    res.status(200).json({
      success: true,
      data: portfolios
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
export const getPortfolioCategoriesList = async (req, res) => {
  try {
    const categories = await getPortfolioCategories();

    res.status(200).json({
      success: true,
      data: categories
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

const express = require('express');
const {
  getPortfolios,
  getPortfolio,
  createNewPortfolio,
  updatePortfolioById,
  deletePortfolioById,
  getFeaturedPortfolioItems,
  getPortfolioByCategory,
  getPortfolioCategoriesList
} = require('../controllers/portfolio.controller.js');

const router = express.Router();

// GET /api/portfolios - Get all portfolios with optional filters
router.get('/', getPortfolios);

// GET /api/portfolios/featured - Get featured portfolios
router.get('/featured', getFeaturedPortfolioItems);

// GET /api/portfolios/categories - Get portfolio categories
router.get('/categories', getPortfolioCategoriesList);

// GET /api/portfolios/category/:category - Get portfolios by category
router.get('/category/:category', getPortfolioByCategory);

// GET /api/portfolios/:id - Get portfolio by ID
router.get('/:id', getPortfolio);

// POST /api/portfolios - Create new portfolio
router.post('/', createNewPortfolio);

// PUT /api/portfolios/:id - Update portfolio
router.put('/:id', updatePortfolioById);

// DELETE /api/portfolios/:id - Delete portfolio
router.delete('/:id', deletePortfolioById);

module.exports = router;

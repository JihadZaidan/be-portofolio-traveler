const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolio.controller');

// Public routes - for users
router.get('/active', portfolioController.getActivePortfolios);
router.get('/featured', portfolioController.getActivePortfolios); // with featured=true query
router.get('/categories', portfolioController.getCategories);
router.get('/:id', portfolioController.getPortfolioById);

// Admin routes - for content management
router.get('/', portfolioController.getAllPortfolios);
router.get('/stats/overview', portfolioController.getPortfolioStats);
router.post('/', portfolioController.createPortfolio);
router.put('/:id', portfolioController.updatePortfolio);
router.delete('/:id', portfolioController.deletePortfolio);
router.patch('/:id/toggle-status', portfolioController.togglePortfolioStatus);
router.patch('/:id/toggle-featured', portfolioController.toggleFeaturedStatus);

module.exports = router;

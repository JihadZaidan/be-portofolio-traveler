const express = require('express');
const router = express.Router();
const {
    getAllShopItems,
    getShopItemById,
    createShopItem,
    updateShopItem,
    deleteShopItem,
    getShopCategories
} = require('../controllers/shop.controller');

// Public routes - untuk user
router.get('/', getAllShopItems); // Get all shop items (public)
router.get('/categories', getShopCategories); // Get all categories
router.get('/:id', getShopItemById); // Get single shop item

// Admin routes - untuk admin shop management
router.post('/', createShopItem); // Create new shop item
router.put('/:id', updateShopItem); // Update shop item
router.delete('/:id', deleteShopItem); // Delete shop item

module.exports = router;

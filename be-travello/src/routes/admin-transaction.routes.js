const express = require('express');
const AdminTransactionController = require('../controllers/admin-transaction.controller.js');
const { authenticateToken, requireAdmin } = require('../middleware/auth.middleware.js');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get all transactions with pagination and filtering
router.get('/', AdminTransactionController.getAllTransactions);

// Get transaction by ID
router.get('/:id', AdminTransactionController.getTransactionById);

// Update transaction status
router.patch('/:id/status', AdminTransactionController.updateTransactionStatus);

// Get payment statistics
router.get('/stats/overview', AdminTransactionController.getPaymentStats);

// Export transactions to CSV
router.get('/export/csv', AdminTransactionController.exportTransactions);

module.exports = router;

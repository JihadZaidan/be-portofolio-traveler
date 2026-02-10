const { Router } = require('express');
const MidtransPaymentController = require('../controllers/payment.controller.js');
// const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware.js');

const router = Router();

// Temporarily disable authentication for testing
// All admin routes require authentication and admin role
// router.use(authenticateToken);
// router.use(requireAdmin);

// Get all transactions for admin (with pagination and filtering)
router.get('/all', MidtransPaymentController.getAllTransactionsForAdmin);

// Get transaction statistics for admin dashboard
router.get('/stats', MidtransPaymentController.getTransactionStats);

// Sync payment status with Midtrans
router.post('/sync/:orderId', MidtransPaymentController.syncPaymentStatus);

// Export transactions to CSV
router.get('/export', MidtransPaymentController.exportTransactions);

module.exports = router;

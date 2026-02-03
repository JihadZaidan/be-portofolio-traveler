const { Router } = require('express');
const PaymentController = require('../controllers/payment.controller.js');
const { authenticateToken } = require('../middlewares/auth.middleware.js');

const router = Router();

// All payment routes require authentication
router.use(authenticateToken);

// Payment processing
router.post('/process', PaymentController.processPayment);

// Get payment methods
router.get('/methods', PaymentController.getPaymentMethods);

// Get payment history
router.get('/history', PaymentController.getPaymentHistory);

// Get payment details
router.get('/details/:paymentId', PaymentController.getPaymentDetails);

// Refund payment
router.post('/refund/:paymentId', PaymentController.refundPayment);

// Verify payment status
router.get('/verify/:paymentId', PaymentController.verifyPayment);

module.exports = router;

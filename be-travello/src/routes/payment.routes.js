const { Router } = require('express');
const MidtransPaymentController = require('../controllers/payment.controller.js');
const { authenticateToken } = require('../middlewares/auth.middleware.js');

const router = Router();

// Get available payment methods (Midtrans supported) - Public endpoint
router.get('/methods', MidtransPaymentController.getPaymentMethods);

// Midtrans payment processing - Temporarily public for testing
router.post('/create', MidtransPaymentController.createPayment);

// Get payment status - Temporarily public for testing
router.get('/status/:orderId', MidtransPaymentController.getPaymentStatus);

// All other routes require authentication
router.use(authenticateToken);

// Get payment history
router.get('/history', MidtransPaymentController.getPaymentHistory);

// Get payment details
router.get('/details/:paymentId', MidtransPaymentController.getPaymentDetails);

// Refund payment
router.post('/refund/:paymentId', MidtransPaymentController.refundPayment);

// Webhook endpoint for Midtrans notifications (no auth required)
router.post('/webhook', MidtransPaymentController.handleWebhook);

module.exports = router;

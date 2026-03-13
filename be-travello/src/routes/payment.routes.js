const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Create payment transaction
router.post('/create', paymentController.createPayment);

// Get payment status
router.get('/status/:orderId', paymentController.getPaymentStatus);

// Cancel payment
router.post('/cancel/:orderId', paymentController.cancelPayment);

// Process Midtrans webhook
router.post('/webhook', paymentController.processWebhook);

// Get available payment methods
router.get('/methods', paymentController.getPaymentMethods);

// Get Midtrans configuration
router.get('/config', paymentController.getConfig);

// Get user transactions
router.get('/my-transactions', paymentController.getUserTransactions);

// Refund payment
router.post('/refund/:orderId', paymentController.refundPayment);

module.exports = router;

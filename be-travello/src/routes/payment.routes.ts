import { Router } from 'express';
import PaymentController from '../controllers/payment.controller.js';
import { authenticateToken } from '../middlewares/auth.middleware.js';

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

export default router;

const express = require('express');
const { authenticateToken, authenticateAdminToken } = require('../middleware/auth.middleware');
const { 
    getAllUsers, 
    getUserStats, 
    updateUserStatus, 
    deleteUser, 
    getActiveChatSessions,
    getAllTransactions,
    updateTransactionStatus,
    getTransactionDetails
} = require('../controllers/admin.controller');

const router = express.Router();

// Public endpoint for admin chat (no auth required for demo)
router.get('/chat-users', getAllUsers);

// Get active chat sessions for admin chat
router.get('/chat-sessions', getActiveChatSessions);

// Get all users with pagination and search (admin auth required)
router.get('/users', authenticateAdminToken, getAllUsers);

// Get user statistics (admin auth required)
router.get('/users/stats', authenticateAdminToken, getUserStats);

// Update user status or role (admin auth required)
router.put('/users/:userId', authenticateAdminToken, updateUserStatus);

// Delete (soft delete) user (admin auth required)
router.delete('/users/:userId', authenticateAdminToken, deleteUser);

// Get all transactions with pagination and filters (admin auth required)
router.get('/transactions', authenticateAdminToken, getAllTransactions);

// Get all transactions without auth (for testing)
router.get('/transactions-test', getAllTransactions);

// Get transaction details (admin auth required)
router.get('/transactions/:transactionId', authenticateAdminToken, getTransactionDetails);

// Update transaction status (admin auth required)
router.put('/transactions/:transactionId', authenticateAdminToken, updateTransactionStatus);

module.exports = router;

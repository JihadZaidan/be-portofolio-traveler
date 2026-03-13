const UserMySQL = require('../models/UserMySQL');
const AdminChatMySQL = require('../models/AdminChatMySQL');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');

// Get all users for admin
const getAllUsers = async (req, res) => {
    try {
        console.log(' Fetching all users from database...');
        const { page = 1, limit = 10, search = '', role = '', isActive = '' } = req.query;
        
        let users;
        let totalCount;
        
        if (search) {
            // Search users by email, username, or displayName
            console.log(' Searching users with query:', search);
            users = await UserMySQL.findMany({
                isActive: isActive === '' ? undefined : isActive === 'true',
                role: role || undefined
            });
            
            // Filter search results
            users = users.filter(user => 
                user.email.toLowerCase().includes(search.toLowerCase()) ||
                user.username.toLowerCase().includes(search.toLowerCase()) ||
                user.displayName.toLowerCase().includes(search.toLowerCase())
            );
            
            totalCount = users.length;
            console.log(` Found ${users.length} users matching search: "${search}"`);
            
            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            users = users.slice(startIndex, endIndex);
            
        } else {
            console.log(' Fetching all users without search');
            users = await UserMySQL.findMany({
                isActive: isActive === '' ? undefined : isActive === 'true',
                role: role || undefined,
                limit: parseInt(limit)
            });
            
            totalCount = users.length;
            console.log(` Found ${users.length} users total`);
        }
        
        console.log(' Sending users response:', users.length, 'users');
        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalUsers: totalCount,
                    limit: parseInt(limit)
                }
            }
        });
        
    } catch (error) {
        console.error(' Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user statistics
const getUserStats = async (req, res) => {
    try {
        const stats = await UserMySQL.getUserStats();
        
        // Get additional stats
        const allUsers = await UserMySQL.findMany();
        const activeUsers = allUsers.filter(user => user.isActive);
        const googleUsers = allUsers.filter(user => user.provider === 'google');
        const localUsers = allUsers.filter(user => user.provider === 'local');
        const adminUsers = allUsers.filter(user => user.role === 'admin');
        
        res.status(200).json({
            success: true,
            data: {
                totalUsers: allUsers.length,
                activeUsers: activeUsers.length,
                inactiveUsers: allUsers.length - activeUsers.length,
                verifiedUsers: activeUsers.filter(user => user.isVerified).length,
                googleUsers: googleUsers.length,
                localUsers: localUsers.length,
                adminUsers: adminUsers.length,
                regularUsers: allUsers.length - adminUsers.length,
                totalSpent: stats.totalSpent || 0,
                avgSpent: stats.avgSpent || 0,
                recentUsers: allUsers
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
            }
        });
        
    } catch (error) {
        console.error('❌ Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update user status (activate/deactivate)
const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive, role } = req.body;
        
        const user = await UserMySQL.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const updateData = {};
        if (isActive !== undefined) updateData.isActive = isActive;
        if (role !== undefined) updateData.role = role;
        
        const updatedUser = await UserMySQL.update(userId, updateData);
        
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user: updatedUser }
        });
        
    } catch (error) {
        console.error('❌ Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await UserMySQL.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Soft delete by deactivating
        await UserMySQL.update(userId, { isActive: false });
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
        
    } catch (error) {
        console.error('❌ Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get active chat sessions for admin
const getActiveChatSessions = async (req, res) => {
    try {
        console.log('📱 Fetching active chat sessions...');
        
        let activeChats = [];
        
        try {
            // Check if MongoDB is connected
            if (mongoose.connection.readyState === 1) {
                const AdminChat = require('../models/AdminChat');
                activeChats = await AdminChat.getActiveChats();
            } else {
                // Use MySQL fallback
                activeChats = await AdminChatMySQL.getActiveChats();
            }
        } catch (dbError) {
            console.warn('⚠️ Could not fetch active chats from database:', dbError.message);
            // Continue with empty chats array
        }
        
        console.log(`✅ Found ${activeChats.length} active chat sessions`);
        
        res.status(200).json({
            success: true,
            data: {
                chats: activeChats,
                totalChats: activeChats.length
            }
        });
        
    } catch (error) {
        console.error('❌ Get active chat sessions error:', error);
        res.status(500).json({
            success: false,
const getAllTransactions = async (req, res) => {
    try {
        console.log('💰 Fetching all transactions from database...');
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            status = '', 
            paymentStatus = '', 
            type = '',
            startDate = '',
            endDate = ''
        } = req.query;
        
        let transactions;
        let totalCount;
        
        // Build query
        const query = {};
        
        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (type) query.type = type;
        
        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        // Search functionality
        if (search) {
            console.log('🔍 Searching transactions with query:', search);
            transactions = await Transaction.find(query)
                .populate('userId', 'name email displayName')
                .sort({ createdAt: -1 });
            
            // Filter search results
            transactions = transactions.filter(transaction => 
                transaction.transactionId.toLowerCase().includes(search.toLowerCase()) ||
                transaction.serviceName.toLowerCase().includes(search.toLowerCase()) ||
                transaction.description.toLowerCase().includes(search.toLowerCase()) ||
                (transaction.userId && transaction.userId.name && transaction.userId.name.toLowerCase().includes(search.toLowerCase())) ||
                (transaction.userId && transaction.userId.email && transaction.userId.email.toLowerCase().includes(search.toLowerCase())) ||
                (transaction.serviceDetails?.customFields?.customerEmail && transaction.serviceDetails.customFields.customerEmail.toLowerCase().includes(search.toLowerCase()))
            );
            
            totalCount = transactions.length;
            console.log(`✅ Found ${transactions.length} transactions matching search: "${search}"`);
            
            // Pagination
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + parseInt(limit);
            transactions = transactions.slice(startIndex, endIndex);
            
        } else {
            console.log('📋 Fetching all transactions without search');
            transactions = await Transaction.find(query)
                .populate('userId', 'name email displayName')
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip((page - 1) * limit);
            
            totalCount = await Transaction.countDocuments(query);
            console.log(`✅ Found ${transactions.length} transactions total`);
        }
        
        // Get transaction statistics
        const stats = await Transaction.getTransactionStats();
        const revenueByMonth = await Transaction.getRevenueByMonth();
        
        // Format transactions for frontend
        const formattedTransactions = transactions.map(transaction => {
            // Determine buyer email with priority
            let buyerEmail = null;
            let buyerName = null;
            
            // Priority 1: User data from userId (logged-in user)
            if (transaction.userId) {
                buyerEmail = transaction.userId.email || transaction.userId.displayName;
                buyerName = transaction.userId.name || transaction.userId.displayName;
            }
            
            // Priority 2: Customer email from custom fields (guest user)
            if (!buyerEmail && transaction.serviceDetails?.customFields?.customerEmail) {
                buyerEmail = transaction.serviceDetails.customFields.customerEmail;
                buyerName = transaction.serviceDetails.customFields.customerName || 'Guest User';
            }
            
            // Fallback
            if (!buyerEmail) {
                buyerEmail = 'Guest User';
                buyerName = 'Guest User';
            }
            
            return {
                ...transaction.toObject(),
                buyerEmail,
                buyerName,
                // Additional fields for frontend compatibility
                buyer: {
                    email: buyerEmail,
                    name: buyerName
                }
            };
        });
        
        console.log('📤 Sending transactions response:', transactions.length, 'transactions');
        res.status(200).json({
            success: true,
            data: {
                transactions: formattedTransactions,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(totalCount / limit),
                    totalTransactions: totalCount,
                    limit: parseInt(limit)
                },
                stats: {
                    totalTransactions: stats[0]?.totalTransactions || 0,
                    totalRevenue: stats[0]?.totalRevenue || 0,
                    paidTransactions: stats[0]?.paidTransactions || 0,
                    pendingTransactions: stats[0]?.pendingTransactions || 0,
                    completedTransactions: stats[0]?.completedTransactions || 0,
                    avgTransactionValue: stats[0]?.avgTransactionValue || 0,
                    revenueByMonth
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Get all transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
        const { status, paymentStatus, adminNotes } = req.body;
        
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
        
        // Auto-set payment date if status is set to paid
        if (paymentStatus === 'paid' && transaction.paymentStatus !== 'paid') {
            updateData.paymentDate = new Date();
        }
        
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            transactionId, 
            updateData, 
            { new: true, runValidators: true }
        ).populate('userId', 'name email displayName');
        
        console.log('✅ Transaction updated:', updatedTransaction.transactionId);
        
        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            data: { transaction: updatedTransaction }
        });
        
    } catch (error) {
        console.error('❌ Update transaction status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get transaction details
const getTransactionDetails = async (req, res) => {
    try {
        const { transactionId } = req.params;
        
        const transaction = await Transaction.findById(transactionId)
            .populate('userId', 'name email displayName avatar');
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: { transaction }
        });
        
    } catch (error) {
        console.error('❌ Get transaction details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserStats,
    updateUserStatus,
    deleteUser,
    getActiveChatSessions,
    getAllTransactions,
    updateTransactionStatus,
    getTransactionDetails
};
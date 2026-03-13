const UserMySQL = require('../models/UserMySQL');
const AdminChatMySQL = require('../models/AdminChatMySQL');
const TransactionMySQL = require('../models/TransactionMySQL');
const ShopItemMySQL = require('../models/ShopItemMySQL');

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
            activeChats = await AdminChatMySQL.getActiveChats();
        } catch (dbError) {
            console.warn('⚠️ Could not fetch active chats from database:', dbError.message);
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
            message: 'Internal server error'
        });
    }
};

// Get all transactions for admin
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
        let stats;
        
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
        
        // Use MySQL for transactions
        console.log('📋 Fetching transactions from MySQL database...');
        
        const result = await TransactionMySQL.getAll({
            page: parseInt(page),
            limit: parseInt(limit),
            status: status !== 'all' ? status : null,
            search: search || null,
            startDate: null,
            endDate: null
        });
        
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message,
                error: result.error
            });
        }
        
        transactions = result.data.transactions;
        totalCount = result.data.pagination.totalTransactions;
        stats = result.data.stats;
        
        // Also fetch shop items to include in admin transactions
        console.log('📦 Fetching shop items from MySQL database...');
        let shopItems = [];
        try {
            shopItems = await ShopItemMySQL.getAll();
            console.log(`📦 Found ${shopItems.length} shop items`);
        } catch (error) {
            console.warn('⚠️ Error fetching shop items:', error.message);
        }
        
        // Convert shop items to transaction format for admin display
        const shopItemTransactions = shopItems.map(shopItem => {
            // Parse price to number
            const price = typeof shopItem.price === 'string' 
                ? parseFloat(shopItem.price.replace(/[^0-9.]/g, '')) 
                : shopItem.price || 0;
            
            return {
                id: shopItem.id || Date.now() + Math.random(),
                transactionId: `SHOP-${shopItem._id}`,
                type: 'shop_item',
                serviceName: shopItem.title || 'Shop Item',
                description: `Shop item: ${shopItem.title}`,
                amount: price,
                currency: 'IDR',
                discount: 0,
                tax: 0,
                finalAmount: price,
                paymentMethod: 'shop_purchase',
                paymentStatus: 'pending',
                status: shopItem.status === 'active' ? 'pending' : 'inactive',
                createdAt: shopItem.createdAt || new Date().toISOString(),
                updatedAt: shopItem.updatedAt || new Date().toISOString(),
                serviceDetails: {
                    shopItemId: shopItem._id,
                    title: shopItem.title,
                    price: shopItem.price,
                    serviceCategory: shopItem.serviceCategory,
                    details: shopItem.details,
                    advantages: shopItem.advantages,
                    packages: shopItem.packages
                },
                buyerEmail: 'shop@travello.com',
                buyerName: 'Shop Item',
                // Additional fields for frontend compatibility
                buyer: {
                    email: 'shop@travello.com',
                    name: 'Shop Item'
                }
            };
        });
        
        // Combine transactions and shop items
        const allTransactions = [...transactions, ...shopItemTransactions];
        
        // Sort by createdAt (newest first)
        allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Update total count to include shop items
        totalCount = allTransactions.length;
        
        // Update stats to include shop items
        const shopItemsActive = shopItems.filter(item => item.status === 'active').length;
        const updatedStats = {
            totalTransactions: (stats.totalTransactions || 0) + shopItems.length,
            totalRevenue: stats.totalRevenue || 0,
            paidTransactions: stats.completedTransactions || 0,
            pendingTransactions: (stats.pendingTransactions || 0) + shopItemsActive,
            completedTransactions: stats.completedTransactions || 0,
            cancelledTransactions: stats.cancelledTransactions || 0,
            avgTransactionValue: stats.totalRevenue && allTransactions.length > 0 
                ? stats.totalRevenue / allTransactions.length 
                : 0
        };
        
        // Format transactions for frontend (MySQL data already formatted)
        const formattedTransactions = allTransactions.map(transaction => {
            // Extract buyer info from serviceDetails or userId
            let buyerEmail = null;
            let buyerName = null;
            
            try {
                // Priority 1: Custom fields (guest users or direct storage)
                if (transaction.serviceDetails) {
                    const serviceDetails = typeof transaction.serviceDetails === 'string' 
                        ? JSON.parse(transaction.serviceDetails) 
                        : transaction.serviceDetails;
                    
                    if (serviceDetails.customFields) {
                        buyerEmail = serviceDetails.customFields.customerEmail;
                        buyerName = serviceDetails.customFields.customerName;
                    }
                }
            } catch (error) {
                console.warn('⚠️ Error parsing serviceDetails:', error.message);
            }
            
            // Priority 2: User ID (logged-in users)
            if (!buyerEmail && transaction.userId) {
                buyerEmail = transaction.userId;
                buyerName = transaction.userId;
            }
            
            // Fallback
            if (!buyerEmail) {
                buyerEmail = 'Guest User';
                buyerName = 'Guest User';
            }
            
            return {
                ...transaction,
                buyerEmail,
                buyerName,
                // Additional fields for frontend compatibility
                buyer: {
                    email: buyerEmail,
                    name: buyerName
                }
            };
        });
        
        console.log('📤 Sending transactions response:', formattedTransactions.length, 'transactions');
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
                stats: updatedStats
            }
        });
        
    } catch (error) {
        console.error('❌ Get all transactions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Update transaction status
const updateTransactionStatus = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { status, paymentStatus, adminNotes } = req.body;

        const existing = await TransactionMySQL.getById(transactionId);
        if (!existing.success || !existing.data || !existing.data.transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        if (!status && !adminNotes) {
            return res.status(400).json({
                success: false,
                message: 'Nothing to update'
            });
        }

        const nextStatus = status;
        const result = await TransactionMySQL.updateStatus(transactionId, nextStatus, adminNotes);
        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: result.message || 'Failed to update transaction',
                error: result.error
            });
        }

        const updated = await TransactionMySQL.getById(transactionId);
        console.log('✅ Transaction updated:', transactionId);
        
        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully',
            data: { transaction: updated.data.transaction }
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

        const result = await TransactionMySQL.getById(transactionId);
        if (!result.success || !result.data || !result.data.transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }

        res.status(200).json({
            success: true,
            data: { transaction: result.data.transaction }
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

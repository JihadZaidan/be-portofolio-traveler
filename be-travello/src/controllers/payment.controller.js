const midtransService = require('../services/midtrans.service');
const { v4: uuidv4 } = require('uuid');
const Transaction = require('../models/Transaction');
const TransactionMySQL = require('../models/TransactionMySQL');
const UserMySQL = require('../models/UserMySQL');

class PaymentController {
    /**
     * Create a new payment transaction for shop order
     */
    async createPayment(req, res) {
        try {
            const {
                itemTitle,
                packageTitle,
                quantity,
                unitPrice,
                subtotal,
                serviceFee,
                total,
                customerInfo,
                userId
            } = req.body;

            // Validate required fields
            if (!itemTitle || !packageTitle || !quantity || !unitPrice || !total) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing required payment information'
                });
            }

            // Generate unique order ID
            const orderId = `SHOP-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

            // Prioritize userId dari request (user yang sedang login)
            let finalUserId = userId;
            
            // If userId is an email (string), try to find the user by email
            if (finalUserId && typeof finalUserId === 'string' && finalUserId.includes('@')) {
                try {
                    const user = await UserMySQL.findOneByEmail(finalUserId);
                    if (user && user.id) {
                        finalUserId = user.id;
                        console.log('👤 Found user by email:', finalUserId);
                    } else {
                        console.log('👤 User not found by email, using guest mode');
                        finalUserId = null;
                    }
                } catch (error) {
                    console.log('👤 Error finding user by email, using guest mode:', error.message);
                    finalUserId = null;
                }
            }
            
            // Jika tidak ada userId, coba ambil dari user yang sedang login (jika ada auth)
            if (!finalUserId && req.user && req.user.id) {
                finalUserId = req.user.id;
            }
            
            // Jika masih tidak ada, gunakan null untuk guest user
            if (!finalUserId) {
                finalUserId = null;
                console.log('👤 Creating transaction for guest user');
            } else {
                console.log('👤 Creating transaction for user:', finalUserId);
            }

            // Create transaction record in database first
            const transactionData = {
                transactionId: orderId,
                userId: finalUserId, // Connected to logged-in user
                type: 'copywriter_service',
                serviceName: itemTitle,
                description: `${packageTitle} - ${quantity} unit(s)`,
                amount: total,
                finalAmount: total,
                paymentMethod: 'midtrans',
                paymentStatus: 'pending',
                serviceDetails: {
                    copywriterPackage: packageTitle.toLowerCase().includes('basic') ? 'basic' : 
                                    packageTitle.toLowerCase().includes('premium') ? 'premium' : 'standard',
                    wordCount: quantity * 1000, // Estimate
                    topic: itemTitle,
                    customFields: {
                        unitPrice,
                        subtotal,
                        serviceFee,
                        quantity,
                        packageTitle,
                        itemTitle,
                        customerEmail: customerInfo?.email || null,
                        customerName: customerInfo?.name || null,
                        // Always store customer email for guest user lookup
                        ...(finalUserId === null && customerInfo?.email && { customerEmail: customerInfo.email })
                    }
                },
                notes: `Order created via Midtrans payment gateway${finalUserId ? ' by logged-in user' : ' by guest user'}`
            };

            let savedTransaction;
            try {
                // Try to save to MySQL first
                const mysqlResult = await TransactionMySQL.create(transactionData);
                if (mysqlResult.success) {
                    savedTransaction = { ...transactionData, id: mysqlResult.data.insertId };
                    console.log('✅ Transaction saved to MySQL database:', savedTransaction.transactionId, 'for user:', finalUserId);
                } else {
                    console.warn('⚠️ Failed to save to MySQL, trying MongoDB:', mysqlResult.message);
                    // Fallback to MongoDB
                    savedTransaction = await Transaction.create(transactionData);
                    console.log('✅ Transaction saved to MongoDB fallback:', savedTransaction.transactionId);
                }
            } catch (dbError) {
                console.error('❌ Failed to save transaction to both databases:', dbError);
                // Continue with Midtrans creation even if database fails
            }

            // Create Midtrans transaction
            const transaction = await midtransService.createShopTransaction({
                orderId,
                itemTitle,
                packageTitle,
                quantity,
                unitPrice,
                subtotal,
                serviceFee,
                total,
                customerInfo: customerInfo || {}
            });

            res.status(200).json({
                success: true,
                message: 'Payment transaction created successfully',
                data: {
                    orderId,
                    token: transaction.token,
                    redirect_url: transaction.redirect_url,
                    client_key: midtransService.getClientKey(),
                    environment: midtransService.getEnvironment(),
                    transactionId: savedTransaction?._id,
                    userId: finalUserId
                }
            });

        } catch (error) {
            console.error('Create payment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to create payment transaction'
            });
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            const status = await midtransService.getTransactionStatus(orderId);

            res.status(200).json({
                success: true,
                message: 'Payment status retrieved successfully',
                data: status
            });

        } catch (error) {
            console.error('Get payment status error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get payment status'
            });
        }
    }

    /**
     * Cancel payment transaction
     */
    async cancelPayment(req, res) {
        try {
            const { orderId } = req.params;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            const result = await midtransService.cancelTransaction(orderId);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });

        } catch (error) {
            console.error('Cancel payment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to cancel payment'
            });
        }
    }

    /**
     * Process Midtrans webhook notification
     */
    async processWebhook(req, res) {
        try {
            const notification = req.body;

            console.log('🔔 Received Midtrans webhook:', {
                order_id: notification.order_id,
                transaction_status: notification.transaction_status,
                payment_type: notification.payment_type
            });

            // Process webhook notification
            const result = await midtransService.processWebhookNotification(notification);

            // Update transaction status in database
            try {
                const transaction = await Transaction.findOne({ 
                    transactionId: result.order_id 
                });

                if (transaction) {
                    // Map Midtrans status to our payment status
                    let paymentStatus = 'pending';
                    let transactionStatus = 'pending';
                    let paymentDate = null;

                    switch (result.transaction_status) {
                        case 'capture':
                        case 'settlement':
                            paymentStatus = 'paid';
                            transactionStatus = 'completed'; // Langsung completed, bukan confirmed
                            paymentDate = new Date(result.settlement_time || result.transaction_time);
                            break;
                        case 'pending':
                            paymentStatus = 'pending';
                            transactionStatus = 'pending';
                            break;
                        case 'deny':
                        case 'expire':
                        case 'cancel':
                            paymentStatus = 'failed';
                            transactionStatus = 'cancelled';
                            break;
                        case 'refund':
                            paymentStatus = 'refunded';
                            transactionStatus = 'cancelled';
                            break;
                    }

                    // Update transaction
                    transaction.paymentStatus = paymentStatus;
                    transaction.status = transactionStatus;
                    transaction.paymentDate = paymentDate;
                    transaction.adminNotes = `Payment updated via webhook: ${result.transaction_status} via ${result.payment_type}`;

                    // Add payment details to serviceDetails
                    if (result.custom_field2) {
                        transaction.serviceDetails.paymentInfo = {
                            midtransStatus: result.transaction_status,
                            paymentType: result.payment_type,
                            transactionTime: result.transaction_time,
                            settlementTime: result.settlement_time,
                            grossAmount: result.gross_amount,
                            fraudStatus: result.fraud_status
                        };
                    }

                    await transaction.save();

                    console.log('✅ Transaction updated successfully:', {
                        transactionId: transaction.transactionId,
                        paymentStatus,
                        transactionStatus,
                        paymentDate
                    });

                    // Here you can add additional logic:
                    // - Send confirmation email to customer
                    // - Send notification to admin
                    // - Update inventory if needed
                    // - Start service delivery

                } else {
                    console.warn('⚠️ Transaction not found for order ID:', result.order_id);
                }
            } catch (dbError) {
                console.error('❌ Failed to update transaction in database:', dbError);
            }

            console.log('✅ Webhook processed successfully:', result);

            // Return 200 to acknowledge receipt
            res.status(200).json({
                success: true,
                message: 'Webhook processed successfully',
                data: result
            });

        } catch (error) {
            console.error('❌ Webhook processing error:', error);
            // Still return 200 to avoid repeated webhook calls
            res.status(200).json({
                success: false,
                message: error.message || 'Failed to process webhook'
            });
        }
    }

    /**
     * Get payment methods (for frontend display)
     */
    async getPaymentMethods(req, res) {
        try {
            const methods = [
                {
                    id: 'credit_card',
                    name: 'Credit Card',
                    description: 'Visa, Mastercard, JCB',
                    icon: 'credit-card',
                    fees: 0,
                    available: true
                },
                {
                    id: 'gopay',
                    name: 'GoPay',
                    description: 'Pay with GoPay e-wallet',
                    icon: 'wallet',
                    fees: 0,
                    available: true
                },
                {
                    id: 'shopeepay',
                    name: 'ShopeePay',
                    description: 'Pay with ShopeePay e-wallet',
                    icon: 'shopping-bag',
                    fees: 0,
                    available: true
                },
                {
                    id: 'bank_transfer',
                    name: 'Bank Transfer',
                    description: 'Transfer from BCA, BRI, BNI, Mandiri',
                    icon: 'building',
                    fees: 0,
                    available: true
                },
                {
                    id: 'echannel',
                    name: 'BCA Virtual Account',
                    description: 'Pay with BCA Virtual Account',
                    icon: 'credit-card',
                    fees: 0,
                    available: true
                },
                {
                    id: 'permata_va',
                    name: 'Permata Virtual Account',
                    description: 'Pay with Permata Virtual Account',
                    icon: 'credit-card',
                    fees: 0,
                    available: true
                },
                {
                    id: 'indomaret',
                    name: 'Indomaret',
                    description: 'Pay at Indomaret stores',
                    icon: 'store',
                    fees: 0,
                    available: true
                },
                {
                    id: 'alfamart',
                    name: 'Alfamart',
                    description: 'Pay at Alfamart stores',
                    icon: 'store',
                    fees: 0,
                    available: true
                }
            ];

            res.status(200).json({
                success: true,
                message: 'Payment methods retrieved successfully',
                data: methods
            });

        } catch (error) {
            console.error('Get payment methods error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to get payment methods'
            });
        }
    }

    /**
     * Get Midtrans configuration
     */
    async getConfig(req, res) {
        try {
            const config = midtransService.getConfig();
            res.status(200).json({
                success: true,
                data: config
            });
        } catch (error) {
            console.error('Get config error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to get configuration'
            });
        }
    }

    /**
     * Get user transactions
     */
    async getUserTransactions(req, res) {
        try {
            // Get user from auth middleware or guest user
            const userEmail = req.user?.email || req.query.email;
            const userId = req.user?.id || req.query.userId;

            if (!userEmail && !userId) {
                return res.status(401).json({
                    success: false,
                    message: 'User authentication required'
                });
            }

            const { page = 1, limit = 10, status, type } = req.query;
            
            // Use MySQL to get user transactions
            const result = await TransactionMySQL.getByUserEmail(userEmail || userId);
            
            if (!result.success) {
                return res.status(500).json({
                    success: false,
                    message: result.message,
                    error: result.error
                });
            }

            let transactions = result.data.transactions;
            
            // Apply additional filters if provided
            if (status) {
                transactions = transactions.filter(t => t.status === status);
            }
            if (type) {
                transactions = transactions.filter(t => t.type === type);
            }

            // Apply pagination
            const total = transactions.length;
            const startIndex = (parseInt(page) - 1) * parseInt(limit);
            const endIndex = startIndex + parseInt(limit);
            const paginatedTransactions = transactions.slice(startIndex, endIndex);

            res.status(200).json({
                success: true,
                message: 'User transactions retrieved successfully',
                data: {
                    transactions: paginatedTransactions,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / parseInt(limit)),
                        totalItems: total,
                        itemsPerPage: parseInt(limit)
                    }
                }
            });

        } catch (error) {
            console.error('Get user transactions error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async refundPayment(req, res) {
        try {
            const { orderId } = req.params;
            const { amount, reason } = req.body;

            if (!orderId) {
                return res.status(400).json({
                    success: false,
                    message: 'Order ID is required'
                });
            }

            const result = await midtransService.refundTransaction(orderId, amount, reason);

            res.status(200).json({
                success: true,
                message: result.message,
                data: result.data
            });

        } catch (error) {
            console.error('Refund payment error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to process refund'
            });
        }
    }
}

module.exports = new PaymentController();

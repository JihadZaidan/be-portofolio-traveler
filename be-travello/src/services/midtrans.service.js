const midtransClient = require('midtrans-client');
const crypto = require('crypto');

class MidtransService {
    constructor() {
        this.serverKey = process.env.MIDTRANS_SERVER_KEY;
        this.clientKey = process.env.MIDTRANS_CLIENT_KEY;
        this.environment = process.env.MIDTRANS_ENVIRONMENT || 'sandbox';
        this.merchantId = process.env.MIDTRANS_MERCHANT_ID;
        
        // Better test mode detection - DISABLED for real Midtrans popup
        this.testMode = false; // Disable test mode to show real Midtrans popup

        console.log('🔧 Midtrans Configuration:');
        console.log('- Server Key:', this.serverKey ? `${this.serverKey.substring(0, 10)}...` : 'NOT SET');
        console.log('- Client Key:', this.clientKey ? `${this.clientKey.substring(0, 10)}...` : 'NOT SET');
        console.log('- Environment:', this.environment);
        console.log('- Test Mode:', this.testMode);

        if (this.testMode) {
            console.log('⚠️  Midtrans running in TEST MODE - Using mock responses');
            return;
        }

        if (!this.serverKey || !this.clientKey) {
            throw new Error('Midtrans credentials are required');
        }

        try {
            this.coreApi = new midtransClient.CoreApi({
                isProduction: this.environment === 'production',
                serverKey: this.serverKey,
                clientKey: this.clientKey
            });

            this.snapApi = new midtransClient.Snap({
                isProduction: this.environment === 'production',
                serverKey: this.serverKey,
                clientKey: this.clientKey
            });
            
            console.log('✅ Midtrans client initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Midtrans client:', error);
            this.testMode = true;
            console.log('⚠️  Falling back to TEST MODE due to initialization error');
        }
    }

    /**
     * Get Midtrans configuration
     */
    getConfig() {
        return {
            client_key: this.clientKey,
            server_key: this.serverKey ? `${this.serverKey.substring(0, 10)}...` : null,
            environment: this.environment,
            merchant_id: this.merchantId,
            test_mode: this.testMode
        };
    }

    /**
     * Get client key
     */
    getClientKey() {
        return this.clientKey;
    }

    /**
     * Get environment
     */
    getEnvironment() {
        return this.environment;
    }

    /**
     * Create a Midtrans transaction for shop payment
     * @param {Object} orderData - Order details
     * @returns {Promise<Object>} - Midtrans transaction response
     */
    async createShopTransaction(orderData) {
        try {
            console.log('🚀 Creating Midtrans transaction with data:', {
                ...orderData,
                serverKey: this.serverKey ? `${this.serverKey.substring(0, 10)}...` : 'NOT SET',
                environment: this.environment,
                testMode: this.testMode
            });

            const {
                orderId,
                itemTitle,
                packageTitle,
                quantity,
                unitPrice,
                subtotal,
                serviceFee,
                total,
                customerInfo = {}
            } = orderData;

            // Test Mode - Return mock response
            if (this.testMode) {
                console.log('🧪 TEST MODE: Creating mock transaction for order:', orderId);
                
                // Simulate processing delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                return {
                    success: true,
                    token: `test-token-${orderId}-${Date.now()}`,
                    redirect_url: `https://mock-midtrans-url.com/pay/${orderId}`,
                    order_id: orderId,
                    test_mode: true
                };
            }

            console.log('📦 Creating PRODUCTION Midtrans transaction...');
            console.log('- Order ID:', orderId);
            console.log('- Total Amount:', total);
            console.log('- Environment:', this.environment);

            // Calculate actual total in IDR
            const itemTotal = (unitPrice * quantity) + serviceFee;
            const grossAmount = itemTotal * 1000; // Convert to IDR

            console.log('- Item Total:', itemTotal);
            console.log('- Gross Amount (IDR):', grossAmount);

            const parameter = {
                transaction_details: {
                    order_id: orderId,
                    gross_amount: grossAmount
                },
                item_details: [{
                    id: `PKG-${packageTitle.substring(0, 10).toUpperCase()}`,
                    price: unitPrice * 1000,
                    quantity: quantity,
                    name: `${itemTitle.substring(0, 20)} - ${packageTitle.substring(0, 15)}`
                }, {
                    id: 'FEE-SERVICE',
                    price: serviceFee * 1000,
                    quantity: 1,
                    name: 'Service Fee'
                }],
                customer_details: {
                    first_name: customerInfo.name || 'Customer',
                    email: customerInfo.email || 'customer@example.com',
                    phone: customerInfo.phone || '',
                    billing_address: {
                        first_name: customerInfo.name || 'Customer',
                        email: customerInfo.email || 'customer@example.com',
                        phone: customerInfo.phone || '',
                        address: customerInfo.address || '',
                        city: customerInfo.city || '',
                        postal_code: customerInfo.postalCode || '',
                        country_code: 'IDN'
                    }
                },
                enabled_payments: [
                    'credit_card',
                    'gopay',
                    'shopeepay',
                    'bank_transfer',
                    'echannel',
                    'bca_klikbca',
                    'bca_klikpay',
                    'bri_epay',
                    'cimb_clicks',
                    'danamon_online',
                    'permata_va',
                    'other_va',
                    'indomaret',
                    'alfamart'
                ],
                callbacks: {
                    finish: `${process.env.FRONTEND_URL}/shop/payment/payment-success`,
                    error: `${process.env.FRONTEND_URL}/shop/payment/payment-failed`,
                    pending: `${process.env.FRONTEND_URL}/shop/payment/payment-pending`
                },
                expiry: {
                    unit: 'minutes',
                    duration: 60
                },
                custom_field1: 'SHOP_PAYMENT',
                custom_field2: JSON.stringify({
                    itemTitle,
                    packageTitle,
                    quantity,
                    unitPrice,
                    subtotal,
                    serviceFee,
                    total
                })
            };

            console.log('📤 Sending transaction to Midtrans API...');
            const transaction = await this.snapApi.createTransaction(parameter);
            
            console.log('✅ Midtrans transaction created successfully:', {
                token: transaction.token ? `${transaction.token.substring(0, 20)}...` : 'NO TOKEN',
                redirect_url: transaction.redirect_url,
                order_id: orderId
            });

            return {
                success: true,
                token: transaction.token,
                redirect_url: transaction.redirect_url,
                order_id: orderId
            };

        } catch (error) {
            console.error('❌ Midtrans transaction creation error:', {
                message: error.message,
                statusCode: error.httpStatusCode,
                apiResponse: error.ApiResponse,
                stack: error.stack
            });
            throw new Error(`Failed to create Midtrans transaction: ${error.message}`);
        }
    }

    /**
     * Get transaction status from Midtrans
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} - Transaction status
     */
    async getTransactionStatus(orderId) {
        try {
            const status = await this.coreApi.transactionStatus(orderId);
            return {
                success: true,
                status: status.transaction_status,
                fraud_status: status.fraud_status,
                payment_type: status.payment_type,
                transaction_time: status.transaction_time,
                settlement_time: status.settlement_time,
                gross_amount: status.gross_amount,
                payment_codes: status.payment_codes,
                bill_key: status.bill_key,
                biller_code: status.biller_code,
                va_numbers: status.va_numbers
            };
        } catch (error) {
            console.error('Midtrans status check error:', error);
            throw new Error(`Failed to get transaction status: ${error.message}`);
        }
    }

    /**
     * Cancel a transaction
     * @param {string} orderId - Order ID
     * @returns {Promise<Object>} - Cancellation result
     */
    async cancelTransaction(orderId) {
        try {
            const result = await this.coreApi.cancelTransaction(orderId);
            return {
                success: true,
                message: 'Transaction cancelled successfully',
                data: result
            };
        } catch (error) {
            console.error('Midtrans cancellation error:', error);
            throw new Error(`Failed to cancel transaction: ${error.message}`);
        }
    }

    /**
     * Refund a transaction
     * @param {string} orderId - Order ID
     * @param {number} amount - Amount to refund
     * @param {string} reason - Refund reason
     * @returns {Promise<Object>} - Refund result
     */
    async refundTransaction(orderId, amount, reason = '') {
        try {
            const parameter = {
                refund_key: `REFUND-${orderId}-${Date.now()}`,
                amount: amount * 1000, // Convert to IDR
                reason: reason
            };

            const result = await this.coreApi.refundTransaction(parameter);
            return {
                success: true,
                message: 'Refund processed successfully',
                data: result
            };
        } catch (error) {
            console.error('Midtrans refund error:', error);
            throw new Error(`Failed to process refund: ${error.message}`);
        }
    }

    /**
     * Verify webhook notification from Midtrans
     * @param {Object} notification - Webhook notification data
     * @returns {boolean} - True if notification is valid
     */
    verifyWebhookNotification(notification) {
        try {
            if (!notification.order_id || !notification.status_code || !notification.signature_key) {
                return false;
            }

            const rawString = `${notification.order_id}${notification.status_code}${this.serverKey}`;
            const calculatedSignature = crypto.createHash('sha512').update(rawString).digest('hex');
            
            return calculatedSignature === notification.signature_key;
        } catch (error) {
            console.error('Webhook verification error:', error);
            return false;
        }
    }

    /**
     * Process webhook notification
     * @param {Object} notification - Webhook notification data
     * @returns {Object} - Processed notification data
     */
    async processWebhookNotification(notification) {
        try {
            if (!this.verifyWebhookNotification(notification)) {
                throw new Error('Invalid webhook signature');
            }

            return {
                success: true,
                order_id: notification.order_id,
                transaction_status: notification.transaction_status,
                fraud_status: notification.fraud_status,
                payment_type: notification.payment_type,
                transaction_time: notification.transaction_time,
                settlement_time: notification.settlement_time,
                gross_amount: notification.gross_amount,
                custom_field1: notification.custom_field1,
                custom_field2: notification.custom_field2 ? JSON.parse(notification.custom_field2) : null
            };
        } catch (error) {
            console.error('Webhook processing error:', error);
            throw new Error(`Failed to process webhook: ${error.message}`);
        }
    }

    /**
     * Get client key for frontend
     * @returns {string} - Client key
     */
    getClientKey() {
        return this.clientKey;
    }

    /**
     * Get environment info
     * @returns {string} - Environment (sandbox/production)
     */
    getEnvironment() {
        return this.environment;
    }
}

module.exports = new MidtransService();

import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/database.config.js';

class PaymentService {
    // Process payment with external gateway
    static async processPayment(paymentData) {
        const { method, amount, currency, customerInfo } = paymentData;
        
        // Get payment method configuration
        const methodConfig = await this.getPaymentMethodConfig(method);
        
        // Calculate fees
        const processingFee = this.calculateFees(amount, methodConfig);
        const totalAmount = amount + processingFee;
        
        // Create payment record
        const payment = {
            id: uuidv4(),
            user_id: paymentData.user_id,
            method,
            amount,
            currency,
            description: paymentData.description,
            booking_id: paymentData.booking_id || null,
            customer_info: JSON.stringify(customerInfo || {}),
            status: 'pending',
            processing_fee: processingFee,
            total_amount: totalAmount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // Save to database
        await this.createPayment(payment);
        
        // Process with payment gateway
        const gatewayResult = await this.processWithGateway(payment, methodConfig);
        
        // Update payment with gateway response
        await this.updatePaymentGatewayResponse(payment.id, gatewayResult);
        
        return {
            paymentId: payment.id,
            status: gatewayResult.status,
            amount: payment.amount,
            processingFee,
            totalAmount,
            gatewayResponse: gatewayResult.response
        };
    }
    
    // Get payment method configuration
    static async getPaymentMethodConfig(method) {
        const config = await db.prepare('SELECT * FROM payment_methods WHERE name = ? AND is_active = 1').get(method);
        
        if (!config) {
            throw new Error(`Payment method ${method} not found or inactive`);
        }
        
        return config;
    }
    
    // Calculate processing fees
    static calculateFees(amount, methodConfig) {
        let fees = 0;
        
        // Percentage fee
        if (methodConfig.fees > 0) {
            fees += (amount * methodConfig.fees) / 100;
        }
        
        // Fixed fee
        if (methodConfig.fixed_fee > 0) {
            fees += methodConfig.fixed_fee;
        }
        
        return Math.round(fees * 100) / 100; // Round to 2 decimal places
    }
    
    // Process payment with external gateway
    static async processWithGateway(payment, methodConfig) {
        // Simulate different payment gateway integrations
        switch (payment.method) {
            case 'credit_card':
                return await this.processCreditCard(payment);
            case 'bank_transfer':
                return await this.processBankTransfer(payment);
            case 'ewallet':
                return await this.processEwallet(payment);
            case 'virtual_account':
                return await this.processVirtualAccount(payment);
            default:
                throw new Error(`Unsupported payment method: ${payment.method}`);
        }
    }
    
    // Credit card processing
    static async processCreditCard(payment) {
        // Simulate credit card processing
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second processing
        
        const isSuccess = Math.random() > 0.1; // 90% success rate
        
        return {
            status: isSuccess ? 'completed' : 'failed',
            response: {
                transactionId: `CC_${Date.now()}`,
                approvalCode: isSuccess ? `APPROV_${Math.random().toString(36).substr(2, 9).toUpperCase()}` : null,
                maskedCard: '****-****-****-1234',
                authCode: isSuccess ? Math.random().toString(36).substr(2, 6).toUpperCase() : null,
                responseCode: isSuccess ? '00' : '05',
                responseMessage: isSuccess ? 'Approved' : 'Declined'
            }
        };
    }
    
    // Bank transfer processing
    static async processBankTransfer(payment) {
        // Generate virtual account
        const vaNumber = `${Math.floor(Math.random() * 9000000000) + 1000000000}`;
        
        return {
            status: 'pending', // Bank transfers are pending until confirmed
            response: {
                virtualAccount: vaNumber,
                bankName: 'BCA Virtual Account',
                accountNumber: vaNumber,
                accountName: 'TRAVELLO PAYMENTS',
                amount: payment.amount,
                expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
                instructions: [
                    'Transfer to the virtual account number above',
                    'Use the exact amount to avoid payment issues',
                    'Payment will be confirmed automatically within 5 minutes'
                ]
            }
        };
    }
    
    // E-wallet processing
    static async processEwallet(payment) {
        // Simulate e-wallet processing
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 second processing
        
        const isSuccess = Math.random() > 0.05; // 95% success rate
        
        return {
            status: isSuccess ? 'completed' : 'failed',
            response: {
                transactionId: `EW_${Date.now()}`,
                referenceId: `REF_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
                phoneNumber: '****-****-1234',
                merchantId: 'MERCH_TRAVELLO',
                responseCode: isSuccess ? '200' : '400',
                responseMessage: isSuccess ? 'Success' : 'Failed'
            }
        };
    }
    
    // Virtual account processing
    static async processVirtualAccount(payment) {
        // Generate virtual account for specific bank
        const banks = ['BCA', 'BNI', 'BRI', 'MANDIRI'];
        const selectedBank = banks[Math.floor(Math.random() * banks.length)];
        const vaNumber = `${selectedBank}${Math.floor(Math.random() * 9000000000) + 1000000000}`;
        
        return {
            status: 'pending', // Virtual accounts are pending until payment
            response: {
                vaNumber: vaNumber,
                bankName: `${selectedBank} Virtual Account`,
                accountNumber: vaNumber,
                accountName: 'TRAVELLO PAYMENTS',
                amount: payment.amount,
                expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
                instructions: [
                    `Transfer to ${selectedBank} Virtual Account`,
                    'Use the exact amount to avoid payment issues',
                    'Payment will be confirmed automatically',
                    'Save the virtual account number for future reference'
                ]
            }
        };
    }
    
    // Create payment record
    static async createPayment(payment) {
        await db.prepare(`
            INSERT INTO payments (
                id, user_id, method, amount, currency, description, 
                booking_id, customer_info, status, processing_fee, 
                total_amount, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            payment.id,
            payment.user_id,
            payment.method,
            payment.amount,
            payment.currency,
            payment.description,
            payment.booking_id,
            payment.customer_info,
            payment.status,
            payment.processing_fee,
            payment.total_amount,
            payment.created_at,
            payment.updated_at
        );
    }
    
    // Update payment with gateway response
    static async updatePaymentGatewayResponse(paymentId, gatewayResult) {
        await db.prepare(`
            UPDATE payments 
            SET status = ?, payment_gateway_response = ?, updated_at = ?
            WHERE id = ?
        `).run(
            gatewayResult.status,
            JSON.stringify(gatewayResult.response),
            new Date().toISOString(),
            paymentId
        );
        
        // Create transaction record
        await this.createTransactionRecord(paymentId, gatewayResult);
    }
    
    // Create transaction record
    static async createTransactionRecord(paymentId, gatewayResult) {
        const transaction = {
            id: uuidv4(),
            payment_id: paymentId,
            type: 'payment',
            amount: gatewayResult.status === 'completed' ? 'amount' : 0, // Will be updated based on actual payment
            currency: 'IDR',
            description: `Payment processing - ${gatewayResult.status}`,
            gateway_transaction_id: gatewayResult.response.transactionId || null,
            gateway_response: JSON.stringify(gatewayResult.response),
            status: gatewayResult.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        await db.prepare(`
            INSERT INTO payment_transactions (
                id, payment_id, type, amount, currency, description,
                gateway_transaction_id, gateway_response, status, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            transaction.id,
            transaction.payment_id,
            transaction.type,
            transaction.amount,
            transaction.currency,
            transaction.description,
            transaction.gateway_transaction_id,
            transaction.gateway_response,
            transaction.status,
            transaction.created_at,
            transaction.updated_at
        );
    }
    
    // Verify payment status
    static async verifyPaymentStatus(paymentId) {
        const payment = await db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
        
        if (!payment) {
            throw new Error('Payment not found');
        }
        
        // For pending payments, check with gateway
        if (payment.status === 'pending') {
            const gatewayStatus = await this.checkGatewayStatus(payment);
            
            if (gatewayStatus.isCompleted) {
                await this.updatePaymentStatus(paymentId, 'completed');
                payment.status = 'completed';
            } else if (gatewayStatus.isExpired) {
                await this.updatePaymentStatus(paymentId, 'expired');
                payment.status = 'expired';
            }
        }
        
        return {
            paymentId: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            method: payment.method,
            createdAt: payment.created_at,
            updatedAt: payment.updated_at,
            isCompleted: payment.status === 'completed',
            isPending: payment.status === 'pending',
            isFailed: payment.status === 'failed'
        };
    }
    
    // Check payment status with gateway
    static async checkGatewayStatus(payment) {
        // Simulate gateway status check
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // For demo purposes, randomly complete some pending payments
        const isCompleted = Math.random() > 0.7; // 30% chance of completion
        const isExpired = Math.random() > 0.95; // 5% chance of expiration
        
        return {
            isCompleted,
            isExpired,
            gatewayResponse: {
                status: isCompleted ? 'completed' : (isExpired ? 'expired' : 'pending'),
                checkedAt: new Date().toISOString()
            }
        };
    }
    
    // Update payment status
    static async updatePaymentStatus(paymentId, status) {
        await db.prepare(`
            UPDATE payments 
            SET status = ?, updated_at = ?
            WHERE id = ?
        `).run(status, new Date().toISOString(), paymentId);
    }
    
    // Process refund
    static async processRefund(paymentId, reason) {
        const payment = await db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
        
        if (!payment) {
            throw new Error('Payment not found');
        }
        
        if (payment.status !== 'completed') {
            throw new Error('Only completed payments can be refunded');
        }
        
        // Simulate refund processing
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const refundResult = {
            refundId: `REF_${Date.now()}`,
            originalPaymentId: paymentId,
            amount: payment.amount,
            reason: reason || 'User requested refund',
            status: 'processed',
            processedAt: new Date().toISOString(),
            estimatedSettlement: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        
        // Update payment status
        await db.prepare(`
            UPDATE payments 
            SET status = 'refunded', refund_reason = ?, refund_processed_at = ?, updated_at = ?
            WHERE id = ?
        `).run(reason, new Date().toISOString(), new Date().toISOString(), paymentId);
        
        // Create refund transaction record
        await this.createTransactionRecord(paymentId, {
            status: 'refunded',
            response: refundResult
        });
        
        return refundResult;
    }
}

export default PaymentService;

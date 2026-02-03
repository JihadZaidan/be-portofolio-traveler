const axios = require('axios');

class PayPalAPIService {
    constructor() {
        this.baseURL = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
        this.clientId = process.env.PAYPAL_CLIENT_ID || '';
        this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        try {
            // Check if token is still valid
            if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
                return this.accessToken;
            }

            const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            
            const response = await axios.post(`${this.baseURL}/v1/oauth2/token`,
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
            
            return this.accessToken;
        } catch (error) {
            console.error('PayPal API - Error getting access token:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with PayPal API');
        }
    }

    async createOrder(orderData) {
        try {
            const accessToken = await this.getAccessToken();
            
            const requestBody = {
                intent: 'CAPTURE',
                purchase_units: [{
                    reference_id: orderData.referenceId || `TRAVELLO_${Date.now()}`,
                    amount: {
                        currency_code: orderData.currency || 'USD',
                        value: orderData.amount.toFixed(2)
                    },
                    description: orderData.description || 'Payment for service'
                }]
            };

            const response = await axios.post(
                `${this.baseURL}/v2/checkout/orders`,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'PayPal-Request-Id': this.generateRequestId()
                    }
                }
            );

            return {
                success: true,
                data: {
                    orderId: response.data.id,
                    status: response.data.status,
                    intent: response.data.intent,
                    purchaseUnits: response.data.purchase_units
                }
            };
        } catch (error) {
            console.error('PayPal API - Order creation error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create PayPal order',
                errorCode: error.response?.data?.name || 'UNKNOWN_ERROR'
            };
        }
    }

    async capturePayment(orderId) {
        try {
            const accessToken = await this.getAccessToken();
            
            const response = await axios.post(
                `${this.baseURL}/v2/checkout/orders/${orderId}/capture`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'PayPal-Request-Id': this.generateRequestId()
                    }
                }
            );

            return {
                success: true,
                data: {
                    orderId: response.data.id,
                    status: response.data.status,
                    purchaseUnits: response.data.purchase_units.map(unit => ({
                        referenceId: unit.reference_id,
                        amount: unit.amount,
                        payee: unit.payee,
                        custom_id: unit.custom_id
                    })),
                    createTime: response.data.create_time,
                    updateTime: response.data.update_time
                }
            };
        } catch (error) {
            console.error('PayPal API - Payment capture error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to capture PayPal payment',
                errorCode: error.response?.data?.name || 'UNKNOWN_ERROR'
            };
        }
    }

    async getOrderStatus(orderId) {
        try {
            const accessToken = await this.getAccessToken();
            
            const response = await axios.get(
                `${this.baseURL}/v2/checkout/orders/${orderId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'PayPal-Request-Id': this.generateRequestId()
                    }
                }
            );

            return {
                success: true,
                data: {
                    orderId: response.data.id,
                    status: response.data.status,
                    intent: response.data.intent,
                    purchaseUnits: response.data.purchase_units,
                    createTime: response.data.create_time,
                    updateTime: response.data.update_time,
                    links: response.data.links
                }
            };
        } catch (error) {
            console.error('PayPal API - Order status error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to get PayPal order status',
                errorCode: error.response?.data?.name || 'UNKNOWN_ERROR'
            };
        }
    }

    async createPaymentSource(paymentData) {
        try {
            const accessToken = await this.getAccessToken();
            
            const requestBody = {
                intent: 'CAPTURE',
                payer: {
                    payment_method: paymentData.paymentMethod || 'paypal'
                },
                transactions: [{
                    amount: {
                        total: paymentData.amount.toFixed(2),
                        currency: paymentData.currency || 'USD'
                    },
                    description: paymentData.description || 'Payment for service',
                    custom_id: paymentData.referenceId || `TRAVELLO_${Date.now()}`
                }]
            };

            const response = await axios.post(
                `${this.baseURL}/v1/payments/payment`,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'PayPal-Request-Id': this.generateRequestId()
                }
            });

            return {
                success: true,
                data: {
                    paymentId: response.data.id,
                    status: response.data.state,
                    intent: response.data.intent,
                    transactions: response.data.transactions,
                    payer: response.data.payer,
                    createTime: response.data.create_time,
                    links: response.data.links
                }
            };
        } catch (error) {
            console.error('PayPal API - Payment creation error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to create PayPal payment',
                errorCode: error.response?.data?.name || 'UNKNOWN_ERROR'
            };
        }
    }

    generateRequestId() {
        return `PAYPAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

module.exports = PayPalAPIService;

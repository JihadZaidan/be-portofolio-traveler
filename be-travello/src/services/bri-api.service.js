const axios = require('axios');

class BRIAPIService {
    constructor() {
        this.baseURL = process.env.BRI_API_URL || 'https://sandbox.bri.co.id';
        this.clientId = process.env.BRI_CLIENT_ID || '';
        this.clientSecret = process.env.BRI_CLIENT_SECRET || '';
        this.apiKey = process.env.BRI_API_KEY || '';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        try {
            // Check if token is still valid
            if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
                return this.accessToken;
            }

            const response = await axios.post(`${this.baseURL}/oauth/client_credential`,
                {
                    grant_type: 'client_credentials',
                    client_id: this.clientId,
                    client_secret: this.clientSecret
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
            
            return this.accessToken;
        } catch (error) {
            console.error('BRI API - Error getting access token:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with BRI API');
        }
    }

    async createPayment(paymentData) {
        try {
            const accessToken = await this.getAccessToken();
            
            const requestBody = {
                brivaNo: paymentData.brivaNo || this.generateBrivaNo(),
                amount: paymentData.amount.toString(),
                customerName: paymentData.customerName,
                description: paymentData.description || 'Payment for service',
                expiredDate: paymentData.expiredDate || this.getExpiredDate(),
                detail: paymentData.detail || '',
                email: paymentData.email || '',
                phone: paymentData.phone || ''
            };

            const response = await axios.post(
                `${this.baseURL}/v1.0/briva`,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-API-KEY': this.apiKey,
                        'X-TIMESTAMP': new Date().toISOString()
                    }
                }
            );

            return {
                success: true,
                data: {
                    brivaNo: response.data.brivaNo,
                    customerName: response.data.customerName,
                    amount: response.data.amount,
                    description: response.data.description,
                    expiredDate: response.data.expiredDate,
                    status: response.data.status,
                    qrUrl: response.data.qrUrl,
                    paymentUrl: response.data.paymentUrl
                }
            };
        } catch (error) {
            console.error('BRI API - Payment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Payment failed',
                errorCode: error.response?.data?.error?.code || 'UNKNOWN_ERROR'
            };
        }
    }

    async getPaymentStatus(brivaNo) {
        try {
            const accessToken = await this.getAccessToken();
            
            const response = await axios.get(
                `${this.baseURL}/v1.0/briva/status/${brivaNo}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-API-KEY': this.apiKey,
                        'X-TIMESTAMP': new Date().toISOString()
                    }
                }
            );

            return {
                success: true,
                data: {
                    brivaNo: response.data.brivaNo,
                    customerName: response.data.customerName,
                    amount: response.data.amount,
                    description: response.data.description,
                    status: response.data.status,
                    paymentDate: response.data.paymentDate,
                    paymentTime: response.data.paymentTime
                }
            };
        } catch (error) {
            console.error('BRI API - Status check error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to get payment status',
                errorCode: error.response?.data?.error?.code || 'UNKNOWN_ERROR'
            };
        }
    }

    async validateAccount(accountNumber) {
        try {
            const accessToken = await this.getAccessToken();
            
            const response = await axios.get(
                `${this.baseURL}/v1.0/account/${accountNumber}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-API-KEY': this.apiKey,
                        'X-TIMESTAMP': new Date().toISOString()
                    }
                }
            );

            return {
                success: true,
                data: {
                    accountNumber: response.data.accountNumber,
                    accountName: response.data.accountName,
                    accountType: response.data.accountType,
                    currency: response.data.currency,
                    balance: response.data.balance
                }
            };
        } catch (error) {
            console.error('BRI API - Account validation error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.message || 'Account validation failed',
                errorCode: error.response?.data?.error?.code || 'UNKNOWN_ERROR'
            };
        }
    }

    generateBrivaNo() {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `${timestamp}${random}`;
    }

    getExpiredDate() {
        const now = new Date();
        now.setDate(now.getDate() + 1); // Add 1 day
        return now.toISOString().split('T')[0];
    }
}

module.exports = BRIAPIService;

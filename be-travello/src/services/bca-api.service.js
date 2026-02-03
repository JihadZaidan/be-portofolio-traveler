const axios = require('axios');

class BCAAPIService {
    constructor() {
        this.baseURL = process.env.BCA_API_URL || 'https://sandbox.bca.co.id';
        this.clientId = process.env.BCA_CLIENT_ID || '';
        this.clientSecret = process.env.BCA_CLIENT_SECRET || '';
        this.apiKey = process.env.BCA_API_KEY || '';
        this.accessToken = null;
        this.tokenExpiry = null;
    }

    async getAccessToken() {
        try {
            // Check if token is still valid
            if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
                return this.accessToken;
            }

            const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
            
            const response = await axios.post(`${this.baseURL}/api/oauth/token`, 
                'grant_type=client_credentials',
                {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiry = new Date(Date.now() + (response.data.expires_in * 1000));
            
            return this.accessToken;
        } catch (error) {
            console.error('BCA API - Error getting access token:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with BCA API');
        }
    }

    async createPayment(paymentData) {
        try {
            const accessToken = await this.getAccessToken();
            
            const requestBody = {
                companyCode: paymentData.companyCode || '52053',
                customerNumber: paymentData.accountNumber,
                currency: paymentData.currency || 'IDR',
                amount: paymentData.amount.toString(),
                transactionDate: new Date().toISOString().split('T')[0],
                referenceID: paymentData.referenceId || `TRAVELLO_${Date.now()}`,
                detail1: paymentData.description || 'Payment for service',
                detail2: paymentData.detail2 || '',
                detail3: paymentData.detail3 || '',
                detail4: paymentData.detail4 || ''
            };

            const response = await axios.post(
                `${this.baseURL}/api/v1.0/general/payment`,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-BCA-Key': this.apiKey,
                        'X-BCA-Timestamp': new Date().toISOString()
                    }
                }
            );

            return {
                success: true,
                data: {
                    paymentId: response.data.PaymentID,
                    referenceId: response.data.ReferenceID,
                    status: response.data.Status,
                    transactionDate: response.data.TransactionDate,
                    amount: response.data.Amount,
                    currency: response.data.Currency
                }
            };
        } catch (error) {
            console.error('BCA API - Payment error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.ErrorMessage || 'Payment failed',
                errorCode: error.response?.data?.ErrorCode || 'UNKNOWN_ERROR'
            };
        }
    }

    async getPaymentStatus(paymentId) {
        try {
            const accessToken = await this.getAccessToken();
            
            const response = await axios.get(
                `${this.baseURL}/api/v1.0/general/payment/${paymentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-BCA-Key': this.apiKey,
                        'X-BCA-Timestamp': new Date().toISOString()
                    }
                }
            );

            return {
                success: true,
                data: {
                    paymentId: response.data.PaymentID,
                    referenceId: response.data.ReferenceID,
                    status: response.data.Status,
                    transactionDate: response.data.TransactionDate,
                    amount: response.data.Amount,
                    currency: response.data.Currency
                }
            };
        } catch (error) {
            console.error('BCA API - Status check error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.ErrorMessage || 'Failed to get payment status',
                errorCode: error.response?.data?.ErrorCode || 'UNKNOWN_ERROR'
            };
        }
    }

    async validateAccount(accountNumber) {
        try {
            const accessToken = await this.getAccessToken();
            
            const response = await axios.get(
                `${this.baseURL}/api/v1.0/account/validation?accountnumber=${accountNumber}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'X-BCA-Key': this.apiKey,
                        'X-BCA-Timestamp': new Date().toISOString()
                    }
                }
            );

            return {
                success: true,
                data: {
                    accountNumber: response.data.AccountNumber,
                    accountName: response.data.AccountName,
                    accountType: response.data.AccountType,
                    currency: response.data.Currency,
                    balance: response.data.Balance
                }
            };
        } catch (error) {
            console.error('BCA API - Account validation error:', error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.ErrorMessage || 'Account validation failed',
                errorCode: error.response?.data?.ErrorCode || 'UNKNOWN_ERROR'
            };
        }
    }
}

module.exports = BCAAPIService;

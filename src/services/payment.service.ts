import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export interface PaymentRequest {
    method: string;
    amount: number;
    currency?: string;
    description: string;
    bookingId?: string;
    customerInfo?: {
        name?: string;
        email?: string;
        phone?: string;
        cardDetails?: {
            cardNumber: string;
            expiryDate: string;
            cvv: string;
            cardholderName: string;
        };
    };
}

export interface PaymentResponse {
    success: boolean;
    message: string;
    data?: {
        paymentId: string;
        status: string;
        amount: number;
        currency: string;
        method: string;
        gatewayResponse?: any;
        createdAt: string;
    };
}

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    icon: string;
    fees: number;
    available: boolean;
}

class PaymentService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }

    async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/process`,
                paymentData,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: any) {
            console.error('Payment processing error:', error);
            throw new Error(error.response?.data?.message || 'Failed to process payment');
        }
    }

    async getPaymentMethods(): Promise<PaymentMethod[]> {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/methods`,
                { headers: this.getAuthHeaders() }
            );
            return response.data.data;
        } catch (error: any) {
            console.error('Get payment methods error:', error);
            throw new Error(error.response?.data?.message || 'Failed to get payment methods');
        }
    }

    async getPaymentHistory(page = 1, limit = 10, status?: string) {
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                ...(status && { status })
            });
            
            const response = await axios.get(
                `${API_BASE_URL}/payments/history?${params}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: any) {
            console.error('Get payment history error:', error);
            throw new Error(error.response?.data?.message || 'Failed to get payment history');
        }
    }

    async getPaymentDetails(paymentId: string) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/details/${paymentId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: any) {
            console.error('Get payment details error:', error);
            throw new Error(error.response?.data?.message || 'Failed to get payment details');
        }
    }

    async verifyPayment(paymentId: string) {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/payments/verify/${paymentId}`,
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: any) {
            console.error('Verify payment error:', error);
            throw new Error(error.response?.data?.message || 'Failed to verify payment');
        }
    }

    async refundPayment(paymentId: string, reason?: string) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/payments/refund/${paymentId}`,
                { reason },
                { headers: this.getAuthHeaders() }
            );
            return response.data;
        } catch (error: any) {
            console.error('Refund payment error:', error);
            throw new Error(error.response?.data?.message || 'Failed to refund payment');
        }
    }
}

export default new PaymentService();

require('dotenv').config({ path: './env.local' });
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Import API Services
const BCAAPIService = require('./src/services/bca-api.service.js');
const BRIAPIService = require('./src/services/bri-api.service.js');
const PayPalAPIService = require('./src/services/paypal-api.service.js');

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5000",
    "http://localhost:5001",
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mobile Banking Notification Service
class MobileBankingNotification {
    constructor() {
        this.notifications = [];
    }

    async sendNotification(bank, phoneNumber, message, amount) {
        const notification = {
            id: uuidv4(),
            bank,
            phoneNumber,
            message,
            amount,
            timestamp: new Date().toISOString(),
            status: 'sent',
            type: 'payment_confirmation'
        };

        // Simulate sending notification to mobile banking
        console.log(`📱 Sending ${bank} notification to ${phoneNumber}:`);
        console.log(`💰 Amount: ${amount}`);
        console.log(`📝 Message: ${message}`);
        
        // Add to notifications log
        this.notifications.push(notification);

        // Simulate different notification styles for different banks
        switch(bank.toLowerCase()) {
            case 'bri':
                return this.sendBRINotification(notification);
            case 'bca':
                return this.sendBCANotification(notification);
            case 'paypal':
                return this.sendPayPalNotification(notification);
            default:
                return notification;
        }
    }

    sendBRINotification(notification) {
        return {
            ...notification,
            bankLogo: '🏦',
            appName: 'BRImo',
            notificationTitle: 'Pembayaran Berhasil',
            notificationBody: `Transaksi sebesar Rp ${notification.amount} telah berhasil diproses`,
            pushNotification: {
                title: 'BRImo - Transaksi Berhasil',
                body: `Rp ${notification.amount} telah dibayar dari rekening Anda`,
                icon: 'bri-icon.png'
            }
        };
    }

    sendBCANotification(notification) {
        return {
            ...notification,
            bankLogo: '🏦',
            appName: 'BCA Mobile',
            notificationTitle: 'Payment Successful',
            notificationBody: `Payment of Rp ${notification.amount} has been processed successfully`,
            pushNotification: {
                title: 'BCA Mobile - Payment Success',
                body: `Rp ${notification.amount} has been charged to your account`,
                icon: 'bca-icon.png'
            }
        };
    }

    sendPayPalNotification(notification) {
        return {
            ...notification,
            bankLogo: '💳',
            appName: 'PayPal',
            notificationTitle: 'Payment Completed',
            notificationBody: `You've successfully paid $${notification.amount} USD`,
            pushNotification: {
                title: 'PayPal - Payment Complete',
                body: `$${notification.amount} has been charged to your PayPal account`,
                icon: 'paypal-icon.png'
            }
        };
    }

    getNotifications() {
        return this.notifications;
    }
}

const notificationService = new MobileBankingNotification();

// Initialize API Services
const bcaService = new BCAAPIService();
const briService = new BRIAPIService();
const paypalService = new PayPalAPIService();

// Payment Processing Functions
async function processPayPalPayment(paymentId, amount, currency, description, customerInfo) {
  try {
    console.log('🔵 Processing PayPal payment with real API...');
    
    // Convert to USD if needed (assuming 1 USD = 15,000 IDR)
    const usdAmount = currency === 'IDR' ? (amount / 15000).toFixed(2) : amount;
    
    // Create PayPal order
    const orderResult = await paypalService.createOrder({
      referenceId: paymentId,
      amount: parseFloat(usdAmount),
      currency: 'USD',
      description: description
    });

    if (!orderResult.success) {
      throw new Error(orderResult.error);
    }

    // Capture payment (in real scenario, this would be done after user approval)
    const captureResult = await paypalService.capturePayment(orderResult.data.orderId);

    if (!captureResult.success) {
      throw new Error(captureResult.error);
    }

    return {
      status: 'completed',
      gatewayResponse: {
        transactionId: `PP_${orderResult.data.orderId}`,
        paypalOrderId: orderResult.data.orderId,
        paypalPaymentId: captureResult.data.orderId,
        amount: `$${usdAmount}`,
        currency: 'USD',
        paymentStatus: captureResult.data.status,
        payerEmail: customerInfo?.paypalEmail || customerInfo?.email || 'customer@example.com',
        merchantId: 'TRAVELLO_MERCHANT',
        createTime: captureResult.data.createTime,
        updateTime: captureResult.data.updateTime
      },
      processedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('PayPal payment error:', error);
    return {
      status: 'failed',
      gatewayResponse: { 
        error: error.message,
        errorCode: 'PAYPAL_API_ERROR'
      },
      processedAt: new Date().toISOString()
    };
  }
}

async function processBRIPayment(paymentId, amount, currency, description, customerInfo) {
  try {
    console.log('🏦 Processing BRI payment with real API...');
    
    // Create BRI payment
    const paymentResult = await briService.createPayment({
      brivaNo: `TRAVELLO${Date.now()}`,
      amount: amount,
      customerName: customerInfo?.accountName || 'Customer Name',
      description: description,
      email: customerInfo?.email,
      phone: customerInfo?.phone,
      expiredDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    if (!paymentResult.success) {
      throw new Error(paymentResult.error);
    }

    return {
      status: 'pending', // BRI payments are typically pending until user pays
      gatewayResponse: {
        transactionId: `BRI_${paymentResult.data.brivaNo}`,
        referenceNumber: paymentResult.data.brivaNo,
        amount: `Rp ${amount.toLocaleString('id-ID')}`,
        currency: 'IDR',
        paymentStatus: 'PENDING',
        accountNumber: customerInfo?.briAccount || customerInfo?.accountNumber || '1234567890',
        accountName: customerInfo?.accountName || 'Customer Name',
        bankCode: '002',
        description: description,
        transactionTime: new Date().toISOString(),
        brivaNo: paymentResult.data.brivaNo,
        expiredDate: paymentResult.data.expiredDate,
        qrUrl: paymentResult.data.qrUrl,
        paymentUrl: paymentResult.data.paymentUrl
      },
      processedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('BRI payment error:', error);
    return {
      status: 'failed',
      gatewayResponse: { 
        error: error.message,
        errorCode: 'BRI_API_ERROR'
      },
      processedAt: new Date().toISOString()
    };
  }
}

async function processBCAPayment(paymentId, amount, currency, description, customerInfo) {
  try {
    console.log('🏦 Processing BCA payment with real API...');
    
    // Create BCA payment
    const paymentResult = await bcaService.createPayment({
      companyCode: '52053',
      accountNumber: customerInfo?.bcaAccount || customerInfo?.accountNumber || '0987654321',
      amount: amount,
      currency: currency,
      referenceId: paymentId,
      description: description
    });

    if (!paymentResult.success) {
      throw new Error(paymentResult.error);
    }

    return {
      status: 'completed',
      gatewayResponse: {
        transactionId: `BCA_${paymentResult.data.paymentId}`,
        billerId: '70012',
        billerName: 'TRAVELLO',
        referenceNumber: paymentResult.data.referenceId,
        amount: `Rp ${amount.toLocaleString('id-ID')}`,
        currency: 'IDR',
        paymentStatus: paymentResult.data.status,
        accountNumber: customerInfo?.bcaAccount || customerInfo?.accountNumber || '0987654321',
        accountName: customerInfo?.accountName || 'Customer Name',
        bankCode: '014',
        description: description,
        transactionDate: paymentResult.data.transactionDate,
        paymentId: paymentResult.data.paymentId
      },
      processedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('BCA payment error:', error);
    return {
      status: 'failed',
      gatewayResponse: { 
        error: error.message,
        errorCode: 'BCA_API_ERROR'
      },
      processedAt: new Date().toISOString()
    };
  }
}

async function processGenericPayment(method, paymentId, amount, currency, description, customerInfo) {
  // Simulate payment processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate success/failure (90% success rate)
  const isSuccess = Math.random() > 0.1;

  const gatewayResponses = {
    credit_card: {
      transactionId: `CC_${Date.now()}`,
      approvalCode: `APPROV_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      maskedCard: customerInfo?.cardDetails?.cardNumber ? 
        `****-****-****-${customerInfo.cardDetails.cardNumber.slice(-4)}` : 
        '****-****-****-1234',
      cardType: 'visa',
      authResponse: 'Approved'
    },
    bank_transfer: {
      virtualAccount: `${Math.random().toString(36).substr(2, 8).toUpperCase()}${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      bankName: 'BCA Virtual Account',
      accountNumber: `1234567890${Math.floor(Math.random() * 1000)}`
    },
    ewallet: {
      transactionId: `EW_${Date.now()}`,
      referenceId: `REF_${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      phoneNumber: customerInfo?.ewalletNumber || '+62 857-9115-8503',
      ewalletType: customerInfo?.ewalletType || 'gopay',
      paymentInstructions: customerInfo?.ewalletType === 'gopay' 
        ? 'Buka aplikasi GoPay, scan QR code, dan masukkan jumlah pembayaran'
        : 'Scan QR code dengan aplikasi E-Wallet apa pun yang mendukung QRIS'
    },
    virtual_account: {
      vaNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      bankName: 'BCA Virtual Account',
      expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  };

  return {
    status: isSuccess ? 'completed' : 'failed',
    gatewayResponse: gatewayResponses[method] || {},
    processedAt: new Date().toISOString()
  };
}

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date().toISOString() });
});

// API info
app.get("/api", (req, res) => {
  res.status(200).json({ 
    message: "Travello API",
    version: "1.0.0",
    endpoints: {
      health: "GET /health - Health check",
      payments: "POST /api/payments/process - Process payment",
      paymentMethods: "GET /api/payments/methods - Get payment methods",
      paymentStatus: "GET /api/payments/status/:paymentId - Check payment status",
      notifications: "GET /api/notifications - Get mobile banking notifications"
    }
  });
});

// Simple auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // Accept mock tokens and login tokens
  if (token.startsWith('mock_jwt_token_') || token.includes('_login_token_') || token.includes('_signup_token_')) {
    const tokenParts = token.split('_');
    const userId = tokenParts[tokenParts.length - 2] || 'user_123';
    
    req.user = {
      id: userId,
      username: 'testuser',
      email: 'test@example.com',
      role: 'user'
    };
    return next();
  }

  res.status(403).json({
    success: false,
    message: 'Invalid or expired token'
  });
};

// Payment routes
app.get('/api/payments/methods', authenticateToken, (req, res) => {
  try {
    const methods = [
      {
        id: 'credit_card',
        name: 'Credit Card',
        description: 'Visa, Mastercard, JCB',
        icon: '💳',
        fees: 2.9,
        available: true
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pay with PayPal account',
        icon: '💙',
        fees: 4.4,
        available: true,
        currency: 'USD'
      },
      {
        id: 'bri',
        name: 'Bank BRI',
        description: 'BRImo Mobile Banking',
        icon: '🏦',
        fees: 2.5,
        available: true,
        currency: 'IDR'
      },
      {
        id: 'bca',
        name: 'Bank BCA',
        description: 'BCA Mobile Banking',
        icon: '🏦',
        fees: 2.0,
        available: true,
        currency: 'IDR'
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Transfer to virtual account',
        icon: '🏦',
        fees: 0,
        available: true
      },
      {
        id: 'ewallet',
        name: 'E-Wallet',
        description: 'GoPay, OVO, Dana, ShopeePay',
        icon: '📱',
        fees: 1.5,
        available: true
      },
      {
        id: 'virtual_account',
        name: 'Virtual Account',
        description: 'BCA, BNI, BRI, Mandiri VA',
        icon: '🔢',
        fees: 0,
        available: true
      }
    ];

    res.json({
      success: true,
      data: methods
    });

  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment methods',
      error: error.message
    });
  }
});

app.post('/api/payments/process', authenticateToken, async (req, res) => {
  try {
    const { 
      method, 
      amount, 
      currency = 'IDR', 
      description, 
      customerInfo 
    } = req.body;

    // Validate required fields
    if (!method || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: 'Method, amount, and description are required'
      });
    }

    // Validate payment method
    const validMethods = ['credit_card', 'paypal', 'bri', 'bca', 'bank_transfer', 'ewallet', 'virtual_account'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }

    // Generate payment ID
    const paymentId = uuidv4();

    // Process payment based on method
    let paymentResult;
    let mobileNotification = null;

    switch(method) {
      case 'paypal':
        paymentResult = await processPayPalPayment(paymentId, amount, currency, description, customerInfo);
        break;
      case 'bri':
        paymentResult = await processBRIPayment(paymentId, amount, currency, description, customerInfo);
        break;
      case 'bca':
        paymentResult = await processBCAPayment(paymentId, amount, currency, description, customerInfo);
        break;
      default:
        paymentResult = await processGenericPayment(method, paymentId, amount, currency, description, customerInfo);
    }

    // Send mobile banking notification if payment is successful
    if (paymentResult.status === 'completed' && customerInfo?.phone) {
      const notificationAmount = method === 'paypal' 
        ? `$${(amount / 15000).toFixed(2)} USD` 
        : `Rp ${amount.toLocaleString('id-ID')}`;
      
      mobileNotification = await notificationService.sendNotification(
        method.toUpperCase(),
        customerInfo.phone,
        `Payment for ${description} has been processed successfully`,
        notificationAmount
      );
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        paymentId,
        status: paymentResult.status,
        amount: parseFloat(amount),
        currency,
        method,
        gatewayResponse: paymentResult.gatewayResponse,
        mobileNotification: mobileNotification,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
});

// Payment status endpoint
app.get('/api/payments/status/:paymentId', authenticateToken, async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Extract payment method from paymentId prefix
    let paymentMethod = 'unknown';
    if (paymentId.startsWith('PP_')) {
      paymentMethod = 'paypal';
    } else if (paymentId.startsWith('BRI_')) {
      paymentMethod = 'bri';
    } else if (paymentId.startsWith('BCA_')) {
      paymentMethod = 'bca';
    }

    let statusResult;
    switch (paymentMethod) {
      case 'paypal':
        // For PayPal, we would check order status
        statusResult = {
          success: true,
          data: {
            paymentId: paymentId,
            status: 'completed',
            lastUpdated: new Date().toISOString()
          }
        };
        break;
      case 'bri':
        // For BRI, check BRIVA status
        const brivaNo = paymentId.replace('BRI_', '');
        statusResult = await briService.getPaymentStatus(brivaNo);
        break;
      case 'bca':
        // For BCA, check payment status
        statusResult = await bcaService.getPaymentStatus(paymentId.replace('BCA_', ''));
        break;
      default:
        statusResult = {
          success: false,
          error: 'Unknown payment method'
        };
    }

    res.json({
      success: statusResult.success,
      data: statusResult.data,
      message: statusResult.success ? 'Payment status retrieved successfully' : statusResult.error
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
});

// Notifications endpoint
app.get('/api/notifications', authenticateToken, (req, res) => {
  try {
    const notifications = notificationService.getNotifications();
    res.json({
      success: true,
      data: {
        notifications: notifications,
        count: notifications.length
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: {
      "GET /health": "Health check",
      "GET /api": "API information",
      "GET /api/payments/methods": "Get payment methods",
      "POST /api/payments/process": "Process payment",
      "GET /api/payments/status/:paymentId": "Check payment status",
      "GET /api/notifications": "Get mobile banking notifications"
    }
  });
});

// Start server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Payment API: http://localhost:${PORT}/api/payments/process`);
  console.log(`📋 API Info: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

const config = {
    // PayPal API configuration
    paypal: {
        // Get these from your PayPal Developer Dashboard
        clientId: process.env.PAYPAL_CLIENT_ID || 'YOUR_SANDBOX_CLIENT_ID',
        clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'YOUR_SANDBOX_CLIENT_SECRET',
        
        // PayPal API endpoints
        sandbox: {
            baseUrl: 'https://api-m.sandbox.paypal.com',
            webUrl: 'https://www.sandbox.paypal.com'
        },
        live: {
            baseUrl: 'https://api-m.paypal.com',
            webUrl: 'https://www.paypal.com'
        },
        
        // Set to 'sandbox' for testing, 'live' for production
        mode: process.env.PAYPAL_MODE || 'sandbox',
        
        // Default currency
        currency: 'USD'
    }
};

// Helper function to get PayPal base URL
config.getPayPalBaseUrl = () => {
    return config.paypal.mode === 'live' 
        ? config.paypal.live.baseUrl 
        : config.paypal.sandbox.baseUrl;
};

// Helper function to get PayPal web URL
config.getPayPalWebUrl = () => {
    return config.paypal.mode === 'live' 
        ? config.paypal.live.webUrl 
        : config.paypal.sandbox.webUrl;
};

module.exports = config;

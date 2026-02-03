# Payment API Setup Guide

This guide will help you set up the payment API integrations for BCA, BRI, and PayPal in your Travello application.

## Prerequisites

- Node.js and npm installed
- Backend server running on port 5000
- Frontend application running on port 5173

## API Configuration

### 1. BCA API Setup

1. **Register for BCA API Access**
   - Visit: [BCA Developer Portal](https://developer.bca.co.id/id/Fitur-API)
   - Create an account and register your application
   - Request access to the following APIs:
     - Account Statement API
     - Fund Transfer API
     - Virtual Account API

2. **Get Your Credentials**
   - Client ID
   - Client Secret
   - API Key
   - Corporate ID

3. **Update Environment Variables**
   ```env
   BCA_API_URL=https://sandbox.bca.co.id
   BCA_CLIENT_ID=your_bca_client_id_here
   BCA_CLIENT_SECRET=your_bca_client_secret_here
   BCA_API_KEY=your_bca_api_key_here
   ```

### 2. BRI API Setup

1. **Register for BRI API Access**
   - Visit: [BRI Developer Portal](https://developers.bri.co.id/id)
   - Create an account and register your application
   - Request access to BRIVA (BRI Virtual Account) API

2. **Get Your Credentials**
   - Client ID
   - Client Secret
   - API Key

3. **Update Environment Variables**
   ```env
   BRI_API_URL=https://sandbox.bri.co.id
   BRI_CLIENT_ID=your_bri_client_id_here
   BRI_CLIENT_SECRET=your_bri_client_secret_here
   BRI_API_KEY=your_bri_api_key_here
   ```

### 3. PayPal API Setup

1. **Create PayPal Developer Account**
   - Visit: [PayPal Developer](https://developer.paypal.com/api/rest/)
   - Create a developer account
   - Create a new application

2. **Get Your Credentials**
   - Client ID
   - Client Secret

3. **Update Environment Variables**
   ```env
   PAYPAL_API_URL=https://api-m.sandbox.paypal.com
   PAYPAL_CLIENT_ID=your_paypal_client_id_here
   PAYPAL_CLIENT_SECRET=your_paypal_client_secret_here
   ```

## Testing the Integration

### 1. Test Payment Methods Endpoint

```bash
curl -X GET http://localhost:5000/api/payments/methods \
  -H "Authorization: Bearer mock_jwt_token_test"
```

### 2. Test Payment Processing

#### BCA Payment
```bash
curl -X POST http://localhost:5000/api/payments/process \
  -H "Authorization: Bearer mock_jwt_token_test" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "bca",
    "amount": 2500000,
    "currency": "IDR",
    "description": "Test BCA payment",
    "customerInfo": {
      "accountName": "Test User",
      "accountNumber": "0987654321",
      "phone": "+62 857-9115-8503",
      "email": "test@example.com"
    }
  }'
```

#### BRI Payment
```bash
curl -X POST http://localhost:5000/api/payments/process \
  -H "Authorization: Bearer mock_jwt_token_test" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "bri",
    "amount": 2500000,
    "currency": "IDR",
    "description": "Test BRI payment",
    "customerInfo": {
      "accountName": "Test User",
      "accountNumber": "1234567890",
      "phone": "+62 857-9115-8503",
      "email": "test@example.com"
    }
  }'
```

#### PayPal Payment
```bash
curl -X POST http://localhost:5000/api/payments/process \
  -H "Authorization: Bearer mock_jwt_token_test" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "paypal",
    "amount": 25,
    "currency": "USD",
    "description": "Test PayPal payment",
    "customerInfo": {
      "paypalEmail": "test@example.com",
      "phone": "+62 857-9115-8503"
    }
  }'
```

### 3. Test Payment Status

```bash
curl -X GET http://localhost:5000/api/payments/status/{paymentId} \
  -H "Authorization: Bearer mock_jwt_token_test"
```

### 4. Test Notifications

```bash
curl -X GET http://localhost:5000/api/notifications \
  -H "Authorization: Bearer mock_jwt_token_test"
```

## Mobile Banking Notifications

The system includes mobile banking notification simulation:

- **BRImo Notifications**: For BRI payments
- **BCA Mobile Notifications**: For BCA payments
- **PayPal Notifications**: For PayPal payments

### Notification Features

- Real-time payment status updates
- Transaction details
- Mobile banking app integration simulation
- Notification history tracking

## Frontend Integration

The frontend includes:

1. **Payment Methods Component**: Displays available payment options
2. **Payment Processing**: Handles API calls and responses
3. **Pending Payment Page**: For payments requiring user action (BRI)
4. **Success Page**: Shows payment confirmation and notifications
5. **Error Handling**: Comprehensive error management

## Security Considerations

1. **Environment Variables**: Never commit API credentials to version control
2. **HTTPS**: Use HTTPS in production
3. **API Rate Limits**: Implement rate limiting for API calls
4. **Input Validation**: Validate all user inputs
5. **Error Handling**: Proper error handling without exposing sensitive information

## Production Deployment

1. **Switch to Production APIs**: Change sandbox URLs to production URLs
2. **Webhook Configuration**: Set up webhooks for payment status updates
3. **Database Integration**: Store payment records in your database
4. **Monitoring**: Implement logging and monitoring
5. **Backup**: Regular backups of payment data

## Troubleshooting

### Common Issues

1. **API Authentication Errors**
   - Check your credentials in `.env` file
   - Verify API keys are correct and active

2. **Payment Failures**
   - Check API rate limits
   - Verify account numbers and details
   - Check network connectivity

3. **Frontend Errors**
   - Check CORS configuration
   - Verify API endpoints are accessible
   - Check browser console for errors

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=payment:*
```

## Support

For API-specific issues:

- **BCA API**: [BCA Developer Support](https://developer.bca.co.id/id/support)
- **BRI API**: [BRI Developer Support](https://developers.bri.co.id/id/support)
- **PayPal API**: [PayPal Developer Support](https://developer.paypal.com/support)

## Next Steps

1. Set up your API credentials
2. Test the integration in sandbox mode
3. Configure webhooks for real-time updates
4. Implement proper error handling
5. Deploy to production with proper security measures

---

**Note**: Always test payment integrations thoroughly in sandbox mode before moving to production.

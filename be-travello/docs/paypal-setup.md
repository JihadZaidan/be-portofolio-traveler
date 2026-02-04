# PayPal Integration Setup Guide

This guide will help you set up PayPal integration for the Travello payment system.

## Prerequisites

- PayPal Developer Account
- Business PayPal account
- Access to PayPal Developer Dashboard

## Step 1: Create PayPal Developer Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Sign up with your PayPal account or create a new one
3. Verify your email and complete the setup

## Step 2: Create PayPal Application

1. Log in to PayPal Developer Dashboard
2. Go to **Apps & Credentials**
3. Click **Create App**
4. Select **Merchant** as app type
5. Choose **Sandbox** for testing or **Live** for production
6. Give your app a name (e.g., "Travello Payment System")
7. Click **Create App**

## Step 3: Get API Credentials

After creating the app, you'll get:
- **Client ID**: Your public identifier
- **Client Secret**: Your private key

## Step 4: Configure Environment Variables

Add the following to your `.env` file:

```bash
# PayPal API Configuration
PAYPAL_CLIENT_ID=your_sandbox_client_id_here
PAYPAL_CLIENT_SECRET=your_sandbox_client_secret_here
PAYPAL_MODE=sandbox
```

For production:
```bash
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_CLIENT_SECRET=your_live_client_secret_here
PAYPAL_MODE=live
```

## Step 5: Update Frontend Configuration

In `fe-travello/index.html`, replace the placeholder client ID:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_ACTUAL_CLIENT_ID&currency=USD"></script>
```

## Step 6: Test PayPal Integration

1. Start the backend server:
   ```bash
   cd be-travello
   npm start
   ```

2. Start the frontend server:
   ```bash
   cd fe-travello
   npm run dev
   ```

3. Navigate to `http://localhost:5173/shop/payment`

4. Select PayPal as payment method

5. Complete the PayPal payment flow

## PayPal Sandbox Testing

For testing without real money:

1. Use PayPal Sandbox accounts:
   - Go to PayPal Developer Dashboard
   - Click **Accounts** under **Sandbox**
   - Use the pre-created buyer account or create a new one

2. Test credentials (default sandbox accounts):
   - **Buyer Email**: personal@example.com
   - **Buyer Password**: pass
   - **Seller Email**: business@example.com  
   - **Seller Password**: pass

## PayPal Webhooks (Optional)

For production, set up webhooks to receive payment notifications:

1. In PayPal Developer Dashboard, go to your app
2. Click **Add Webhook**
3. Enter your webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Select events:
   - PAYMENT.AUTHORIZATION.CREATED
   - PAYMENT.AUTHORIZATION.VOIDED
   - PAYMENT.CAPTURE.COMPLETED
   - PAYMENT.CAPTURE.DENIED
   - PAYMENT.SALE.COMPLETED
   - PAYMENT.SALE.DENIED

## Common Issues

### 1. "PayPal SDK failed to load"
- Check your Client ID is correct
- Ensure your internet connection is stable
- Verify the SDK URL is correct

### 2. "Payment failed"
- Check backend environment variables
- Verify PayPal credentials are correct
- Check server logs for detailed errors

### 3. CORS errors
- Ensure your CORS origin is set correctly in backend
- Check that your frontend URL is whitelisted in PayPal app settings

## Security Notes

- Never expose your Client Secret in frontend code
- Always use HTTPS in production
- Validate PayPal payment IDs on the backend
- Implement proper error handling and logging

## Production Checklist

- [ ] Switch to live PayPal credentials
- [ ] Update frontend SDK to use live Client ID
- [ ] Set up webhooks for payment notifications
- [ ] Test with real payments (small amounts)
- [ ] Monitor for payment failures and disputes
- [ ] Set up proper logging and monitoring

## Support

For PayPal-specific issues:
- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal Stack Overflow](https://stackoverflow.com/questions/tagged/paypal)
- [PayPal Community Forum](https://www.paypal-community.com/)

For application-specific issues:
- Check the application logs
- Review the payment controller code
- Verify environment variables are set correctly

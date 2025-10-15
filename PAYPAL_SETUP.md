# PayPal Braintree SDK Setup for ZipAppUpdate

## 🚀 Development Build Setup

Since we're using Expo with native dependencies (Braintree SDK), you need to create a **development build**.

### Step 1: Install EAS CLI
```bash
npm install -g @expo/eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS Build
```bash
eas build:configure
```

### Step 4: Create Development Build
```bash
# For Android
eas build --profile development --platform android

# For iOS (requires Apple Developer Account)
eas build --profile development --platform ios
```

### Step 5: Install Development Build on Device
1. Download the build from EAS dashboard
2. Install on your physical device or emulator
3. Run: `npx expo start --dev-client`

## 🔧 Braintree Configuration

### Step 1: Get Braintree Credentials
1. Sign up at [Braintree Sandbox](https://sandbox.braintreegateway.com/)
2. Get your:
   - **Merchant ID**
   - **Public Key** 
   - **Private Key**
   - **Client Token** (generated server-side)

### Step 2: Backend Integration
You'll need to create an endpoint to generate client tokens:

```javascript
// Example Node.js endpoint
app.get('/client_token', (req, res) => {
  gateway.clientToken.generate({}, (err, response) => {
    res.send(response.clientToken);
  });
});
```

### Step 3: Update PayPal Service
In `app/services/PayPalService.ts`, update:
- `merchantId`: Your Braintree Merchant ID
- Client token URL in your app

## 📱 Current Implementation Status

### ✅ Completed:
- **Braintree SDK Integration**: Added to app.json and package.json
- **PayPal Service**: Created with simulation fallback
- **API Integration**: Added PayPal endpoints and Redux actions
- **UI Integration**: Updated Recharge component with PayPal flow
- **Development Mode**: Works with simulation for testing

### 🚧 Next Steps:
1. **Create Development Build**: Follow steps above
2. **Get Braintree Account**: Set up sandbox credentials
3. **Backend Update**: Add client token generation
4. **Production Setup**: Switch to production Braintree environment

## 🧪 Testing

### Development Mode:
- PayPal will use **simulation mode** until SDK is properly configured
- Shows realistic UI flow and API integration
- Generates mock payment nonces for testing

### Production Mode:
- Requires development build with Braintree SDK
- Real PayPal authentication flow
- Actual payment processing

## 🔒 Security Notes

- **Never expose** Braintree private keys in client code
- **Client tokens** should be generated server-side
- **Payment nonces** are single-use and expire quickly
- **Sandbox mode** for development, **production mode** for live payments

## 📋 Environment Variables

Add to your backend:
```
BRAINTREE_ENVIRONMENT=sandbox  # or 'production'
BRAINTREE_MERCHANT_ID=your_merchant_id
BRAINTREE_PUBLIC_KEY=your_public_key
BRAINTREE_PRIVATE_KEY=your_private_key
```

## 🏆 Benefits of This Setup

1. **PCI Compliance**: Braintree handles sensitive payment data
2. **Security**: Payment nonces instead of card details
3. **User Experience**: Native PayPal UI
4. **Flexibility**: Supports multiple payment methods
5. **Production Ready**: Same system as ZipNewApp

## 🆘 Troubleshooting

### "Braintree SDK not available"
- Ensure development build is created with `eas build`
- Check app.json includes Braintree plugin
- Verify installation: `npm list react-native-braintree-dropin-ui`

### PayPal Flow Issues
- Check client token is valid and not expired
- Verify Braintree environment (sandbox vs production)
- Ensure proper merchant ID configuration

### Build Errors
- Clear cache: `npx expo start --clear`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Update Expo CLI: `npm install -g @expo/eas-cli@latest`
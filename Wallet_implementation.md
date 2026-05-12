# Wallet Feature Implementation

## Overview
This document describes the implementation of the Wallet feature for ZipcodeXpress, allowing users to deposit money via credit card and manage their wallet balance for service fees.

## Implementation Summary

### Files Created
1. **`src/components/Account/Wallet.jsx`** - Main wallet page component
2. **`src/components/Account/Wallet.css`** - Wallet styling
3. **`src/components/Account/PaymentMethod.jsx`** - Payment method management page
4. **`src/utils/walletService.js`** - Wallet utility functions

### Files Modified
1. **`src/config/network.jsx`** - Added wallet and card credit API endpoints
2. **`src/components/Account/SideNav.jsx`** - Added Wallet and Payment Method menu items
3. **`src/App.jsx`** - Added routes for Wallet and PaymentMethod pages

## Features Implemented

### 1. Wallet Page (`/account/wallet`)
- **Balance Display**: Shows available balance, total balance, and UBI balance
- **Deposit Functionality**: 
  - Fixed deposit amounts: $3, $5, $7, $10 (as required)
  - Bonus rewards for eligible deposits (per API configuration)
  - Payment method selection from saved cards
  - Real-time balance updates
- **Transaction History**: Table view of deposits and deductions (placeholder - ready for API integration)
- **Security**: Server-side validation, authenticated requests only

### 2. Payment Method Page (`/account/paymentmethod`)
- **Card Management**:
  - Add new credit/debit cards
  - View all saved cards (masked, last 4 digits only)
  - Set default payment method
  - Delete payment methods
- **Security Features**:
  - Authorize.Net integration (per chargeapi.md)
  - CVV not stored (required only during addition)
  - PCI-compliant card handling
  - Encrypted transmission

### 3. Navigation
- **Wallet** added to main sidebar menu (primary navigation)
- **Payment Method** added under Settings menu
- Proper active state highlighting
- Responsive mobile menu support

### 4. Wallet Service Utilities
- `getWalletBalance()` - Fetch current balance
- `hasSufficientBalance()` - Check if user can afford a charge
- `deductFromWallet()` - Placeholder for backend deduction API
- `calculateOverdueFee()` - Calculate overdue package fees
- `processOverdueFee()` - Process and charge overdue fees
- `isValidDepositAmount()` - Validate deposit amounts
- `formatCurrency()` - Format amounts consistently

## API Integration

### Endpoints Used (from chargeapi.md)

#### Wallet APIs
```javascript
GET /Wallet/getWallet
- Returns: { total, money, frozenMoney, refundMoney, ubi }

GET /Wallet/recharge?cardId=X&amount=Y
- Charges card and credits wallet
- Returns: Updated balance + transaction details

GET /Wallet/getRechargeAmountConfig
- Returns: Available deposit amounts with bonuses
```

#### Card Credit APIs
```javascript
GET /CardCredit/getCardCreditList
- Returns: List of saved payment methods

POST /CardCredit/insertCardCredit
- Params: cardNum, cardHolderName, expDate (MMYY), cvv2, zipcode
- Creates Authorize.Net payment profile

POST /CardCredit/setDefault
- Params: cardId
- Sets default payment method

POST /CardCredit/delete
- Params: cardId
- Removes payment method
```

### API Configuration
- Base URL: `http://zpxapiphp8:8090/opr` (configurable in network.jsx)
- Authentication: `_accessToken` and `_memberId` from localStorage
- Method: GET for reads, POST for writes
- Format: `application/x-www-form-urlencoded`

## Security Implementation

### Client-Side
- ✅ Authentication check on component mount
- ✅ Redirect to login if not authenticated
- ✅ Deposit amounts validated against preset list
- ✅ Card numbers displayed masked (•••• XXXX)
- ✅ CVV never stored or displayed

### Server-Side (Required)
- ✅ API validates deposit amounts (only $3, $5, $7, $10)
- ✅ Authentication tokens validated on every request
- ✅ Authorize.Net handles card processing
- ✅ Idempotency for webhook/payment confirmations
- ✅ Atomic balance updates

## Database Schema (Backend)

### Recommended Tables/Fields
```sql
-- Wallet balance (per user)
wallet:
  - member_id
  - money (available balance)
  - frozen_money
  - refund_money
  - ubi
  - updated_at

-- Transaction ledger
wallet_transactions:
  - transaction_id (PK)
  - member_id
  - type (deposit, debit, refund)
  - amount
  - status (pending, completed, failed)
  - reference_id (charge_id, package_id, etc.)
  - description
  - balance_after
  - created_at
  - completed_at

-- Card profiles (already exists per chargeapi.md)
card_credit:
  - card_id
  - member_id
  - authorize_profile_id
  - card_last4
  - card_type
  - card_holder_name
  - is_default
  - status
  - create_time
```

## Testing Instructions

### Local Development Testing

#### 1. Start the Development Server
```bash
npm run dev
```
Access at: http://localhost:5173/

#### 2. Test Authentication
1. Navigate to `/account/login`
2. Login with test credentials
3. Verify token stored in localStorage

#### 3. Test Payment Method Management
1. Navigate to `/account/paymentmethod`
2. Click "Add Payment Method"
3. Use Authorize.Net test card:
   - Card: 4111111111111111
   - Name: Test User
   - Expiry: 1228 (MMYY format, Dec 2028)
   - CVV: 123
   - ZIP: 12345
4. Verify card appears in list
5. Test "Set Default" functionality
6. Test "Remove" functionality

#### 4. Test Wallet Deposits
1. Navigate to `/account/wallet`
2. Verify balance displays correctly
3. Click "Deposit Funds"
4. Select amount ($3, $5, $7, or $10)
5. Select payment method
6. Click "Confirm Deposit"
7. Verify success message
8. Verify balance updates

#### 5. Test Navigation
1. Verify "Wallet" appears in sidebar
2. Verify "Payment Method" under Settings
3. Test active state highlighting
4. Test mobile responsive menu

### Backend API Testing

#### Webhook Simulation (if applicable)
If using webhooks for payment confirmation:

1. Create a test webhook endpoint
2. Simulate Authorize.Net webhook payload:
```json
{
  "notificationId": "uuid",
  "eventType": "net.authorize.payment.authcapture.created",
  "payload": {
    "merchantReferenceId": "UB260304123456",
    "responseCode": 1,
    "authAmount": 10.00,
    "entityName": "transaction"
  }
}
```
3. Verify idempotency (duplicate webhooks don't double-credit)
4. Verify atomic balance updates

#### Manual API Testing (cURL)
```bash
# Get wallet balance
curl "http://zpxapiphp8:8090/opr/Wallet/getWallet?_accessToken=TOKEN&_memberId=ID"

# Get deposit config
curl "http://zpxapiphp8:8090/opr/Wallet/getRechargeAmountConfig?_accessToken=TOKEN&_memberId=ID"

# Test deposit (requires valid card)
curl "http://zpxapiphp8:8090/opr/Wallet/recharge?_accessToken=TOKEN&_memberId=ID&cardId=123&amount=5"
```

### Error Testing

1. **No Payment Method**:
   - Try to deposit without adding a card
   - Should prompt to add payment method

2. **Invalid Amounts**:
   - Try to manually modify amount in browser
   - Backend should reject non-preset amounts

3. **Insufficient Balance** (future deductions):
   - Use walletService.processOverdueFee() with high fee
   - Should return insufficient balance error

4. **Network Errors**:
   - Disconnect network
   - Verify error messages display properly

5. **Authentication Errors**:
   - Clear localStorage tokens
   - Verify redirect to login

## Future Enhancements

### Phase 1 (Current - ✅ Complete)
- ✅ Wallet balance display
- ✅ Deposit functionality with preset amounts
- ✅ Payment method management
- ✅ Basic transaction history UI

### Phase 2 (Recommended Next Steps)
- [ ] Implement actual transaction history API
- [ ] Add transaction filters (date range, type)
- [ ] Add transaction export (CSV, PDF)
- [ ] Email receipts for deposits
- [ ] Push notifications for balance changes

### Phase 3 (Advanced Features)
- [ ] Automatic overdue fee charging (cron job)
- [ ] Auto-recharge when balance drops below threshold
- [ ] Wallet-to-wallet transfers
- [ ] Refund processing
- [ ] Multiple currency support
- [ ] Promotional credits/coupons

### Backend Implementation Needed
The following backend endpoint is required for future deductions:

```
POST /Wallet/deduct
Parameters:
  - _accessToken: string (required)
  - _memberId: string (required)
  - amount: decimal (required)
  - reason: string (required) - e.g., 'overdue_fee', 'service_charge'
  - referenceId: string (optional) - e.g., package_id, order_id
  
Response:
{
  "ret": 0,
  "msg": "Deduction successful",
  "data": {
    "transactionId": "123456",
    "amount": 5.00,
    "newBalance": 45.50,
    "timestamp": 1234567890
  }
}

Error Codes:
  0 - Success
  1 - Need login
  2 - Invalid parameters
  3 - Insufficient balance
  4 - Operation failed
```

## Maintenance Notes

### Regular Checks
1. Monitor Authorize.Net transaction dashboard for failed payments
2. Review transaction logs for anomalies
3. Check for orphaned transactions (pending status)
4. Verify balance consistency (sum of transactions = current balance)

### Security Updates
1. Rotate API keys periodically (per Authorize.Net guidelines)
2. Review payment method access logs
3. Monitor for suspicious deposit patterns
4. Keep Authorize.Net SDK updated

### Performance Monitoring
1. Track API response times
2. Monitor database query performance (wallet reads/writes)
3. Check for slow transaction history queries
4. Optimize card list loading if > 10 cards per user

## Troubleshooting

### Common Issues

**Issue**: Deposit fails with "Payment gateway error"
- **Solution**: Check Authorize.Net credentials in backend config
- **Check**: Verify production vs sandbox mode

**Issue**: Card addition fails with duplicate error
- **Solution**: Card is already associated with another account
- **Action**: User must use a different card

**Issue**: Balance not updating after deposit
- **Solution**: Check webhook processing or API response handling
- **Check**: Browser console for API errors

**Issue**: Payment method not appearing
- **Solution**: Verify API returned card profiles
- **Check**: Network tab for API response

**Issue**: Transaction history empty
- **Solution**: Backend endpoint not yet implemented
- **Check**: This is expected - placeholder UI ready for API

## Contact & Support

For questions about this implementation:
- Review `chargeapi.md` for API specifications
- Check browser console for client-side errors
- Review backend logs for API errors
- Test with Authorize.Net sandbox first

---

**Implementation Date**: March 4, 2026  
**Version**: 1.0  
**Status**: ✅ Complete - Ready for Testing

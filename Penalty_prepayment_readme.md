# Pickup Penalty Pre-Payment System

## Overview
This system allows users to pay overdue storage penalties **before** picking up their packages, preventing blocked pickups due to unpaid fees.

## ⚠️ Important Business Rule
**Once penalty is paid, the amount is LOCKED - no additional charges apply at pickup, regardless of how many more days pass.**

**Example:**
- Day 5: Package 2 days overdue → User pays $10 penalty
- Day 15: User finally picks up (now 12 days overdue)
- At pickup: **NO additional charge** - locker opens immediately
- Total cost: $10 (locked at payment time)

**Rationale:**
- Simple for users - pay once, pick up anytime
- Encourages pre-payment (removes pickup time pressure)
- Predictable costs (no surprise charges at locker)
- System stability (no complex differential charging logic)

---

## Database Changes

### SQL Migration
Run this SQL to add penalty tracking columns to `o_store` table:

```sql
-- Add penalty_paid_time column to o_store table
-- This tracks when a penalty was paid in advance before pickup
-- NULL = not paid, timestamp = paid at that time

ALTER TABLE `o_store` 
ADD COLUMN `penalty_paid_time` INT(10) NULL DEFAULT NULL COMMENT 'Penalty pre-payment timestamp' AFTER `pick_time`;

-- Add penalty_amount column to track the exact amount paid
ALTER TABLE `o_store` 
ADD COLUMN `penalty_amount` DECIMAL(10,2) NULL DEFAULT NULL COMMENT 'Penalty amount paid' AFTER `penalty_paid_time`;

-- Index for querying unpaid penalties
CREATE INDEX `idx_penalty_paid` ON `o_store` (`penalty_paid_time`);
```

---
Complete workflow for prePay:
User Pre-Pays via App:
1. User opens app, sees package is overdue
2. App shows: "3 days overdue, $15 penalty"
3. User clicks [Pay Penalty]
4. Calls payPickupPenalty(memberId, storeId)
5. Wallet charged $15.00
6. o_store.penalty_paid_time = NOW
7. o_store.penalty_amount = 15.00

User Picks Up at Terminal
1. User scans QR code
2. Terminal calls validatePickupChargeRule(memberId)
3. API checks penalty_paid_time (already set)
4. Returns: allowPickup = true (penalty was paid)
5. Terminal calls commitForPick
6. getPickList → chargenew checks penalty_paid_time
7. Sees it's already paid, skips charging
8. Locker opens successfully

## API Endpoints

### 1. Validate Pickup Charge Rule

**Endpoint:** `POST /opr/zippora/validatePickupChargeRule` (Opr module - Admin/Operator Interface)  
**Endpoint:** `POST /cabinet/zippora/validatePickupChargeRule` (Cabinet module - Terminal Interface)

**Purpose:** Check if any penalties exist for a member's packages. Now also checks if penalties were pre-paid.

**Parameters:**
- `_accessToken`: Access token
- `_memberId`: Current logged in member/operator ID
- `memberId`: Member ID to check (can be different from logged in user)
- `storeId`: Optional - check specific package only

**Response - No Penalty:**
```json
{
  "ret": 0,
  "msg": "允许取件",
  "data": {
    "allowPickup": true,
    "totalPenalty": 0,
    "packages": []
  }
}
```

**Response - Penalty Exists:**
```json
{
  "ret": 0,
  "msg": "有未支付罚金，不允许取件",
  "data": {
    "allowPickup": false,
    "totalPenalty": 50.00,
    "packages": [
      {
        "storeId": "444880",
        "boxModelId": "10013",
        "storeTime": 1234567890,
        "overdueDays": 10,
        "penaltyAmount": 50.00,
        "isPenaltyPaid": false,
        "paidAmount": 0,
        "paidTime": 0
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "ret": 1,
  "msg": "未找到公寓信息",
  "data": {
    "allowPickup": true,
    "totalPenalty": 0,
    "packages": []
  }
}
```

---

### 2. Pay Pickup Penalty

**Endpoint:** `POST /opr/zippora/payPickupPenalty` (Opr module - Admin/Operator Interface)  
**Endpoint:** `POST /cabinet/zippora/payPickupPenalty` (Cabinet module - Terminal Interface)

**Purpose:** Allow users to pay overdue storage penalties in advance before pickup.

**Parameters:**
- `_accessToken`: Access token
- `_memberId`: Current logged in member/operator ID
- `memberId`: Member ID to pay for (can be different from logged in user)
- `storeId`: Optional - specific package ID to pay penalty for (omit to pay for all unpaid packages)

**Response - Success:**
```json
{
  "ret": 0,
  "msg": "罚金支付成功",
  "data": {
    "paidAmount": 50.00,
    "remainingBalance": 125.50,
    "paidPackages": [
      {
        "storeId": "444880",
        "paidAmount": 50.00,
        "overdueDays": 10
      }
    ]
  }
}
```

**Response - Insufficient Balance:**
```json
{
  "ret": 2,
  "msg": "钱包余额不足",
  "data": {
    "requiredAmount": 50.00,
    "currentBalance": 25.00
  }
}
```

**Error Codes:**
- `ret: 0` - Success, penalty paid
- `ret: 1` - Validation error (no packages found, no charge rule, already paid, etc.)
- `ret: 2` - Insufficient wallet balance (user must recharge wallet first)
- `ret: 3` - Payment processing failed (wallet deduction error)

**Payment Flow:**
1. **Penalty Calculation**: Amount calculated based on current overdue days (grace period + daily rate + max penalty cap)
2. **Wallet Balance Check**: System verifies wallet has sufficient funds
   - Fetches wallet record: `D('Wallet')->getWallet($memberId)`
   - Checks balance: `$wallet['money'] >= $totalPenalty`
   - If insufficient → returns error `ret: 2` with required and current balance
   - If sufficient → proceeds to payment
3. **Wallet Deduction**: Penalty amount is deducted from wallet balance
   - Creates statement array with penalty details
   - Calls: `D('Wallet')->subWallet($memberId, $amount, 0, 0, $stArr)`
   - Statement created with type `box_penalty_prepaid`
4. **Charge Record**: Transaction is recorded in `o_charge` table with:
   - `member_id`: Member being charged
   - `apartment_id`: Apartment ID from cabinet lookup
   - `store_id`: Package store ID
   - `charge_rule`: Full charge rule JSON from apartment
   - `charge_type`: 'box_penalty'
   - `charge_channel`: 'online' (from wallet)
   - `paid_status`: 1 (paid)
   - `paid_time`: Current timestamp
   - `create_time`: Current timestamp
5. **Store Update**: `o_store` record is updated with:
   - `penalty_paid_time`: Current timestamp (locks the penalty)
   - `penalty_amount`: Amount charged (locked amount)

**Important Notes:**
- **All payments are made from wallet only** - no direct credit card charges
- **User must have sufficient wallet balance** - otherwise returns `ret: 2` with balance details
- **Once paid, penalty is marked as paid** - prevents double-charging during pickup
- **Supports batch payment** - if storeId not specified, pays for all unpaid overdue packages
- **Apartment lookup from cabinet** - gets correct charge rule from package's cabinet location
- **Complete transaction recording** - creates records in `o_charge`, `wallet_statement`, and `o_store` tables

---

## Integration Workflow

### For Terminal Software (Locker Screen)

```
User scans QR code or enters pickup code
↓
1. Call validatePickupChargeRule(memberId)
↓
2. Check response:
   - ret = 0: Allow pickup, call commitForPick
   - ret = 1: Block pickup, show payment screen
↓
3. If blocked, show:
   - Total penalty: $15.00
   - Overdue days: 3 days
   - [Pay Now] button
↓
4. User clicks [Pay Now]
   - Call payPickupPenalty(memberId, storeId)
   - Show success message
   - Allow pickup or return to step 1
```

### For Mobile App

```
User views package list
↓
1. Call validatePickupChargeRule(memberId) for each package
↓
2. Display penalty info if exists:
   - "Package overdue: 3 days"
   - "Penalty: $15.00"
   - [Pay Penalty] button
↓
3. User clicks [Pay Penalty]
   - Call payPickupPenalty(memberId, storeId)
   - Update wallet balance display
   - Show "Penalty paid, you can now pick up"
```

---

## Backend Logic Changes

### 1. validatePickupChargeRule() - Updated
- Now checks `o_store.penalty_paid_time` field
- Skips penalty calculation for packages with `penalty_paid_time != NULL`
- Only calculates penalties for unpaid packages

### 2. chargenew() in OChargeModel - Updated ⭐ **CRITICAL LOGIC**
```php
// At the beginning of box_penalty processing
if(!empty($extra['storeId'])) {
    $storeRecord = D('OStore')->where(['store_id' => $extra['storeId']])->find();
    if(!empty($storeRecord['penalty_paid_time'])) {
        // ✅ Penalty was pre-paid - SKIP ALL CHARGING
        // No matter how many days have passed since payment
        // The amount is locked at penalty_amount value
        return ['ret' => 0, 'data' => 0];
    }
}
// If not pre-paid, calculate current penalty and charge
```

**Key Behavior:**
- If `penalty_paid_time` exists → **Skip all penalty calculations and wallet deductions**
- System does NOT recalculate penalty based on current date
- System does NOT charge difference between paid amount and current penalty
- User can pick up without any additional payment, regardless of delay

### 3. getPickList() / commitForPick - No Changes Needed
- Already calls `chargenew()` which now checks for pre-payment
- Existing logic will automatically skip charging if penalty was pre-paid

---

## Penalty Calculation Formula

```
Grace Period: 3 days free storage
Daily Penalty: $5.00 per day
Max Penalty Days: 10 days cap

Example:
- Package stored: Jan 1, 2026
- Current date: Jan 8, 2026
- Days stored: 7 days
- Grace period: 3 days
- Overdue days: 7 - 3 = 4 days
- Penalty: $5.00 × 4 = $20.00

If stored 15 days:
- Overdue days: 15 - 3 = 12 days
- Capped at max: 10 days
- Penalty: $5.00 × 10 = $50.00
```

---

## Testing Scenarios

### Scenario 1: Normal Flow (No Penalty)
1. Package stored for 2 days (within grace period)
2. Call `validatePickupChargeRule` → ret=0, allowPickup=true
3. Call `commitForPick` → successfully opens locker

### Scenario 2: Penalty Exists - Payment at Terminal
1. Package stored for 5 days (2 days overdue)
2. Call `validatePickupChargeRule` → ret=1, penalty=$10.00
3. Terminal shows payment screen
4. Call `payPickupPenalty` → wallet charged $10.00
5. Call `validatePickupChargeRule` again → ret=0 (paid)
6. Call `commitForPick` → opens locker, no additional charge

### Scenario 3: Penalty Pre-Paid via App
1. User checks app, sees package overdue
2. Pays penalty via app: `payPickupPenalty`
3. Later goes to terminal
4. Call `validatePickupChargeRule` → ret=0 (already paid)
5. Call `commitForPick` → opens locker immediately

### Scenario 4: Insufficient Wallet Balance - Must Recharge
1. Package overdue, penalty = $15.00
2. User wallet balance = $8.00
3. Call `payPickupPenalty` → ret=2 (insufficient funds)
4. System returns:
   ```json
   {
     "ret": 2,
     "msg": "钱包余额不足",
     "data": {
       "requiredAmount": 15.00,
       "currentBalance": 8.00
     }
   }
   ```
5. Frontend shows: "Insufficient wallet balance, please recharge"
6. User navigates to wallet recharge screen
7. User adds $20 to wallet (new balance: $28.00)
8. User returns to penalty payment screen
9. Call `payPickupPenalty` again → ret=0 (success)
10. Wallet balance after payment: $13.00
11. Records created in `o_charge`, `wallet_statement`, and `o_store` tables

### Scenario 5: Complete Pre-Payment Flow with Database Records
1. **Initial State:**
   - Wallet balance: $50.00
   - Package overdue: 4 days ($20 penalty)
   - `o_store.penalty_paid_time`: NULL
2. **Payment Request:**
   - Call `payPickupPenalty(memberId=30003, storeId=444880)`
   - System checks wallet: $50.00 ≥ $20.00 ✓
3. **Transaction Processing:**
   - Wallet deducted: $20.00 → new balance $30.00
   - Insert into `o_charge`: charge_id=10500, amount=20.00, paid_status=1, charge_channel='online'
   - Insert into `wallet_statement`: statement_id=50200, amount=-20.00, statement_desc='box_penalty_prepaid'
   - Update `o_store`: penalty_paid_time=1772821862, penalty_amount=20.00
4. **Response:**
   ```json
   {
     "ret": 0,
     "msg": "罚金支付成功",
     "data": {
       "paidAmount": 20.00,
       "remainingBalance": 30.00,
       "paidPackages": [
         {
           "storeId": "444880",
           "paidAmount": 20.00,
           "overdueDays": 4
         }
       ]
     }
   }
   ```
5. **At Terminal (later):**
   - Call `validatePickupChargeRule` → ret=0, allowPickup=true, totalPenalty=0
   - Call `commitForPick` → chargenew() sees penalty_paid_time is set, skips charging
   - Locker opens without additional charge

### Scenario 6: ⭐ Locked Penalty - User Delays Pickup After Payment
**This scenario demonstrates the most important business rule: penalty is locked at payment time.**

1. **Day 5 (Package 2 days overdue):**
   - Current penalty: $10.00 (2 days × $5)
   - User pays via app: `payPickupPenalty`
   - Wallet charged: $10.00
   - `o_store.penalty_paid_time` = Day 5 timestamp
   - `o_store.penalty_amount` = 10.00

2. **Day 15 (User finally goes to pick up - now 12 days overdue):**
   - If calculated fresh, penalty would be: $50.00 (10 days × $5, capped at max)
   - User arrives at terminal, scans QR code
   - Call `validatePickupChargeRule`:
     ```json
     {
       "ret": 0,
       "msg": "允许取件",
       "data": {
         "allowPickup": true,
         "totalPenalty": 0,
         "packages": []
       }
     }
     ```
   - Call `commitForPick` → chargenew() checks `penalty_paid_time`
   - Sees Day 5 timestamp exists → **SKIPS all penalty calculations**
   - Does NOT compare $10 paid vs $50 current
   - Does NOT charge $40 difference
   - **Locker opens with ZERO additional charges**

3. **Final Cost to User:**
   - Total paid: $10.00 (only the Day 5 payment)
   - Additional charges at pickup: $0.00
   - User saved: $40.00 by delaying pickup

**Key Takeaway:** Once penalty is paid, it's locked forever. This is by design for simplicity.

---

## Database Record Examples

### Tables Involved
The payment system interacts with three main tables:
1. **`o_store`** - Package storage records with penalty payment status
2. **`o_charge`** - All charge transactions (signup fees, monthly fees, penalties)
3. **`wallet_statement`** - Wallet transaction history (created by subWallet)

---

### o_store Table - Before Payment
```sql
SELECT store_id, to_member_id, store_time, pick_time, penalty_paid_time, penalty_amount
FROM o_store WHERE store_id = 444880;

store_id | to_member_id | store_time | pick_time | penalty_paid_time | penalty_amount
---------|--------------|------------|-----------|-------------------|---------------
444880   | 30003        | 1609459200 | NULL      | NULL              | NULL
```

### o_store Table - After Pre-Payment
```sql
SELECT store_id, to_member_id, store_time, pick_time, penalty_paid_time, penalty_amount
FROM o_store WHERE store_id = 444880;

store_id | to_member_id | store_time | pick_time | penalty_paid_time | penalty_amount
---------|--------------|------------|-----------|-------------------|---------------
444880   | 30003        | 1609459200 | NULL      | 1772821862        | 50.00
```

### o_charge Table - Payment Record
```sql
SELECT charge_id, member_id, apartment_id, store_id, charge_type, charge_channel, amount, paid_status, paid_time
FROM o_charge WHERE member_id = 30003 AND charge_type = 'box_penalty'
ORDER BY charge_id DESC LIMIT 1;

charge_id | member_id | apartment_id | store_id | charge_type | charge_channel | amount | paid_status | paid_time
----------|-----------|--------------|----------|-------------|----------------|--------|-------------|------------
10500     | 30003     | 10009        | 444880   | box_penalty | online         | 50.00  | 1           | 1772821862
```

### wallet_statement Table - Deduction Record
```sql
SELECT statement_id, member_id, amount, statement_type, statement_desc, channel
FROM wallet_statement WHERE member_id = 30003 AND statement_desc = 'box_penalty_prepaid'
ORDER BY statement_id DESC LIMIT 1;

statement_id | member_id | amount  | statement_type | statement_desc       | channel
-------------|-----------|---------|----------------|---------------------|--------
50200        | 30003     | -50.00  | zippora        | box_penalty_prepaid | account
```

### o_store Table - After Pickup
```sql
SELECT store_id, to_member_id, store_time, pick_time, penalty_paid_time, penalty_amount
FROM o_store WHERE store_id = 444880;

store_id | to_member_id | store_time | pick_time  | penalty_paid_time | penalty_amount
---------|--------------|------------|------------|-------------------|---------------
444880   | 30003        | 1609459200 | 1772823000 | 1772821862        | 50.00
```

**Key Points:**
- `o_charge` record shows the complete transaction with `charge_channel = 'online'` (wallet payment)
- `wallet_statement` shows negative amount (deduction) with description 'box_penalty_prepaid'
- `o_store.penalty_paid_time` prevents duplicate charging during actual pickup

---

## Rollback Plan

If you need to remove this feature:

```sql
-- Remove the columns
ALTER TABLE `o_store` DROP COLUMN `penalty_paid_time`;
ALTER TABLE `o_store` DROP COLUMN `penalty_amount`;
ALTER TABLE `o_store` DROP INDEX `idx_penalty_paid`;
```

Then revert the code changes to `validatePickupChargeRule()`, remove `payPickupPenalty()`, and revert `chargenew()`.

---

## Notes

1. **⭐ LOCKED PENALTY AMOUNT (Most Important)**:
   - Once penalty is paid, the amount is **permanently locked**
   - **No additional charges** apply at pickup time, regardless of delay
   - Example: Pay $10 on Day 5, pick up on Day 15 → Still only $10 total
   - System does NOT recalculate penalty at pickup
   - System does NOT charge difference for additional days
   - This encourages pre-payment and provides cost predictability
   - **Trade-off**: Users who delay pickup after payment avoid additional fees

2. **Wallet-Only Payments**: All penalty payments are processed through wallet balance only
   - No direct credit card charges for penalties
   - Users must have sufficient wallet balance before payment
   - System returns `ret: 2` if balance is insufficient with required and current balance details
   - Users must recharge wallet first, then retry penalty payment

3. **Partial Payments Not Supported**: User must pay full penalty amount in one transaction

4. **Penalty Grows Daily (Before Payment)**: If user waits longer before paying, penalty increases
   - But once paid, penalty is locked (see point #1)

5. **Max Penalty Cap**: Penalty stops growing after max_penalty days reached

6. **Transaction Recording**: All payments create records in three tables:
   - `o_charge` - Official charge transaction record
   - `wallet_statement` - Wallet deduction history
   - `o_store` - Penalty paid timestamp and amount

7. **No Refunds**: Once paid, penalty is not refunded even if picked up immediately

8. **Double-Charge Prevention**: System checks `penalty_paid_time` to prevent charging twice

---

## Support

For questions or issues, check:
- API documentation in `apidoc` folder
- Error logs in `Runtime/Logs/`
- Database queries for debugging payment status

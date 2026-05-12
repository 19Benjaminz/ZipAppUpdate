# ZPI Payment Method API

## Purpose

This document is for the mobile app team.

Use the `zpi` payment endpoints for the mobile app payment method page and recharge page.

`/opr` is the web-side implementation reference. The `zpi` payment-method endpoints are now aligned to the same backend behavior for:

- Saved credit card list
- Add credit card
- Set default credit card
- Delete credit card
- Wallet balance
- Recharge amount options
- Wallet recharge by saved card
- PayPal or Braintree token and checkout

## Base URL

Example:

```text
http://tp8api:8091/zpi
```

## Auth

All payment APIs require login.

Pass these parameters on every request:

- `_accessToken`
- `_memberId`

Example:

```text
_accessToken=YOUR_ACCESS_TOKEN
_memberId=30003
```

If login is invalid or expired, the API returns:

```json
{
  "ret": 1,
  "msg": "Need login!",
  "data": null
}
```

## Endpoint Summary

| Feature | Method | Path |
|---|---|---|
| Get wallet | `GET` or `POST` | `/wallet/getWallet` |
| Get recharge options | `GET` or `POST` | `/wallet/getRechargeAmountConfig` |
| Recharge wallet by saved card | `POST` | `/wallet/recharge` |
| Get saved cards | `GET` or `POST` | `/cardCredit/getCardCreditList` |
| Add card | `POST` | `/cardCredit/insertCardCredit` |
| Set default card | `POST` | `/cardCredit/setDefault` |
| Delete card | `POST` | `/cardCredit/delete` |
| Get PayPal or Braintree client token | `POST` | `/paypal/token` |
| Recharge wallet by PayPal or Braintree | `POST` | `/paypal/checkout` |
| Alias for Braintree checkout | `POST` | `/paypal/braintreecheckout` |

Notes:

- Mobile should use the `zpi` endpoints in this document.
- For write operations, use `POST`.
- Some environments also expose dashed route aliases such as `wallet/get-wallet`, but the mobile team should use the controller-style endpoints shown above unless the gateway layer explicitly requires the dashed route.

## 1. Get Wallet

Returns the current member wallet summary.

### Request

```http
GET /zpi/wallet/getWallet?_accessToken=YOUR_ACCESS_TOKEN&_memberId=30003
```

### Response

```json
{
  "ret": 0,
  "msg": "Success",
  "data": {
    "total": 1537,
    "money": 937,
    "frozenMoney": 0,
    "refundMoney": 937,
    "ubi": 600
  }
}
```

### Field Notes

- `money`: cash wallet balance
- `frozenMoney`: frozen cash amount
- `ubi`: current UBI points balance
- `total`: `money + frozenMoney`

## 2. Get Recharge Amount Config

Returns the allowed recharge amounts and the UBI bonus for each one.

### Request

```http
GET /zpi/wallet/getRechargeAmountConfig?_accessToken=YOUR_ACCESS_TOKEN&_memberId=30003
```

### Response

```json
{
  "ret": 0,
  "msg": "Success",
  "data": [
    {
      "amount": 3,
      "plus": 0,
      "plusUbi": 0
    },
    {
      "amount": 5,
      "plus": 1,
      "plusUbi": 100
    },
    {
      "amount": 10,
      "plus": 2,
      "plusUbi": 200
    }
  ]
}
```

### Mobile Usage

Use this API to build the recharge preset selection UI.

Display suggestion:

- `$5 + bonus 100 points`
- `$10 + bonus 200 points`

## 3. Get Saved Card List

Returns all saved credit cards for the current member.

### Request

```http
GET /zpi/cardCredit/getCardCreditList?_accessToken=YOUR_ACCESS_TOKEN&_memberId=30003
```

### Response

```json
{
  "ret": 0,
  "msg": "Success",
  "data": {
    "cardList": [
      {
        "cardId": 10001,
        "cardLast4": "1234",
        "cardType": "Visa",
        "cardHolderName": "Tom Jackson",
        "createTime": 1772810000,
        "updateTime": 1772810000,
        "isDefault": 1,
        "status": 0,
        "statusMsg": "ok"
      }
    ]
  }
}
```

### Field Notes

- `cardId`: use this for recharge, set default, and delete
- `cardLast4`: last 4 digits only
- `isDefault`: `1` means default card
- `status`: `0` means usable
- `statusMsg`: backend status description

## 4. Add Credit Card

Creates a new payment profile and saves the card to the current member.

### Request

```http
POST /zpi/cardCredit/insertCardCredit
Content-Type: application/x-www-form-urlencoded
```

### Parameters

| Name | Required | Type | Notes |
|---|---|---|---|
| `_accessToken` | yes | string | login token |
| `_memberId` | yes | string or number | current member id |
| `cardNum` | yes | string | card number |
| `cardHolderName` | yes | string | card holder name |
| `expDate` | yes | string | 4 digits, format `MMYY`, example `0628` |
| `cvv2` | yes | string | card CVV |
| `zipcode` | conditionally | string | required if member profile has no zipcode |
| `isDefault` | no | string or number | pass `1` to set as default |

### Example Request Body

```text
_accessToken=YOUR_ACCESS_TOKEN
&_memberId=30003
&cardNum=4111111111111111
&cardHolderName=Tom Jackson
&expDate=0628
&cvv2=123
&zipcode=92677
&isDefault=1
```

### Success Response

```json
{
  "ret": 0,
  "msg": "Success",
  "data": null
}
```

### Error Codes

| ret | Meaning |
|---|---|
| `1` | need login |
| `2` | invalid card number |
| `3` | empty card holder name |
| `4` | empty zipcode |
| `5` | invalid expiry date |
| `6` | empty cvv2 |
| `7` | card already bound by another member |
| `8` | insert card fail |
| `9` | payment gateway profile creation failed, check `msg` |

## 5. Set Default Card

Sets one saved card as the default payment method.

### Request

```http
POST /zpi/cardCredit/setDefault
Content-Type: application/x-www-form-urlencoded
```

### Parameters

| Name | Required | Type |
|---|---|---|
| `_accessToken` | yes | string |
| `_memberId` | yes | string or number |
| `cardId` | yes | string or number |

### Success Response

```json
{
  "ret": 0,
  "msg": "Success",
  "data": null
}
```

### Error Codes

| ret | Meaning |
|---|---|
| `2` | wrong param |
| `3` | fail to set as default card |

## 6. Delete Card

Deletes a saved card.

### Request

```http
POST /zpi/cardCredit/delete
Content-Type: application/x-www-form-urlencoded
```

### Parameters

| Name | Required | Type |
|---|---|---|
| `_accessToken` | yes | string |
| `_memberId` | yes | string or number |
| `cardId` | yes | string or number |

### Success Response

```json
{
  "ret": 0,
  "msg": "Success",
  "data": null
}
```

### Error Codes

| ret | Meaning |
|---|---|
| `2` | wrong param |
| `3` | fail to delete card |
| `4` | card not exist |

## 7. Recharge Wallet by Saved Card

Charges the selected saved credit card, writes a recharge statement, then credits the wallet balance and any UBI bonus.

### Request

```http
POST /zpi/wallet/recharge
Content-Type: application/x-www-form-urlencoded
```

### Parameters

| Name | Required | Type | Notes |
|---|---|---|---|
| `_accessToken` | yes | string | login token |
| `_memberId` | yes | string or number | current member id |
| `cardId` | yes | string or number | selected saved card id |
| `amount` | yes | number | recharge amount |

### Example Request Body

```text
_accessToken=YOUR_ACCESS_TOKEN
&_memberId=30003
&cardId=10001
&amount=10
```

### Success Response

```json
{
  "ret": 0,
  "msg": "Success",
  "data": {
    "responseCode": "1",
    "messageCode": "1",
    "acceptedButHeld": false,
    "authCode": "ABCD12",
    "transId": "1234567890",
    "transHash": "...",
    "accountNumber": "XXXX1111",
    "accountType": "Visa",
    "refId": "UB260312123456",
    "amount": 10,
    "ctr": "This transaction has been approved.",
    "total": 947,
    "money": 947,
    "frozenMoney": 0,
    "refundMoney": 947,
    "ubi": 800
  }
}
```

### Error Codes

| ret | Meaning |
|---|---|
| `2` | empty cardId or invalid amount |
| `3` | charge failed, check `msg` |
| `4` | wrong cardId or card not owned by current member |

## 8. Get PayPal or Braintree Token

Returns the Braintree client token for the mobile SDK.

### Request

```http
POST /zpi/paypal/token
Content-Type: application/x-www-form-urlencoded
```

### Parameters

| Name | Required | Type |
|---|---|---|
| `_accessToken` | yes | string |
| `_memberId` | yes | string or number |

### Success Response

```json
{
  "ret": 0,
  "msg": "Success",
  "data": {
    "token": "CLIENT_TOKEN_FROM_BRAINTREE"
  }
}
```

### Failure Response

```json
{
  "ret": 2,
  "msg": "Braintree is not configured!",
  "data": null
}
```

## 9. PayPal or Braintree Checkout

Creates a recharge statement and then credits the wallet.

### Request

```http
POST /zpi/paypal/checkout
Content-Type: application/x-www-form-urlencoded
```

### Parameters

| Name | Required | Type | Notes |
|---|---|---|---|
| `_accessToken` | yes | string | login token |
| `_memberId` | yes | string or number | current member id |
| `payment_method_nonce` | yes | string | nonce from Braintree SDK |
| `amount` | yes | number | recharge amount |

### Success Response

```json
{
  "ret": 0,
  "msg": "Success",
  "data": {
    "transactionId": "BRAINTREE_TXN_ID",
    "amount": 10
  }
}
```

### Failure Response

```json
{
  "ret": 2,
  "msg": "Paypal charge failed!",
  "data": null
}
```

## 10. Braintree Checkout Alias

This is an alias to the same implementation as `/zpi/paypal/checkout`.

### Request

```http
POST /zpi/paypal/braintreecheckout
Content-Type: application/x-www-form-urlencoded
```

### Parameters

Same as `/zpi/paypal/checkout`.

## Recommended Mobile Flow

### Payment Method Page

1. Call `/zpi/cardCredit/getCardCreditList`
2. Render saved cards
3. Allow set default
4. Allow delete
5. Provide add-card entry

### Add Card Flow

1. User enters card info
2. Call `/zpi/cardCredit/insertCardCredit`
3. On success, reload `/zpi/cardCredit/getCardCreditList`

### Recharge Page

1. Call `/zpi/wallet/getWallet`
2. Call `/zpi/wallet/getRechargeAmountConfig`
3. Call `/zpi/cardCredit/getCardCreditList`
4. User selects amount and saved card
5. Call `/zpi/wallet/recharge`
6. Refresh wallet and statement data after success

### PayPal or Braintree Recharge Flow

1. Call `/zpi/paypal/token`
2. Use the returned token in the mobile Braintree SDK
3. Get `payment_method_nonce` from the SDK
4. Call `/zpi/paypal/checkout`
5. Refresh wallet and statement data after success

## UI Notes

- Show default card at top if `isDefault = 1`
- Disable cards where `status != 0`
- Show `statusMsg` for unusable cards
- For recharge presets, use `amount`, `plus`, and `plusUbi`
- Show wallet cash and UBI balances separately

## Related Source Files

- [app/zpi/controller/CardCredit.php](c:\Development\zpxapi_tp8app\app\zpi\controller\CardCredit.php)
- [app/zpi/controller/Wallet.php](c:\Development\zpxapi_tp8app\app\zpi\controller\Wallet.php)
- [app/zpi/controller/Paypal.php](c:\Development\zpxapi_tp8app\app\zpi\controller\Paypal.php)
- [app/common/Charge.php](c:\Development\zpxapi_tp8app\app\common\Charge.php)
- [app/common/model/CardCreditModel.php](c:\Development\zpxapi_tp8app\app\common\model\CardCreditModel.php)
- [app/common/model/WalletModel.php](c:\Development\zpxapi_tp8app\app\common\model\WalletModel.php)

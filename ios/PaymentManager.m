//
//  PaymentManager.m
//  ZipcodeXpress
//
//  Created by Lin Yang on 2017/9/27.
//  Copyright © 2017 Facebook. All rights reserved.
//

#import "PaymentManager.h"
#import "BTAPIClient.h"
#import "BTPayPalDriver.h"
#import "BTPayPalRequest.h"
#import "BTPayPalAccountNonce.h"
#import "BTCardClient.h"
#import "BTCard.h"
#import "BTCardNonce.h"
#import "BTDropInController.h"
#import "BTDropInRequest.h"
#import "BTDropInResult.h"

@interface PaymentManager()
@property (nonatomic, strong) BTAPIClient *braintreeClient;
@end

@implementation PaymentManager

RCT_EXPORT_MODULE();

// Existing PayPal method
RCT_EXPORT_METHOD(payWithAmount:(NSString *)amount callback:(RCTResponseSenderBlock)callback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    self.braintreeClient = [[BTAPIClient alloc] initWithAuthorization:@"sandbox_5rj7bnb5_ggbpfszgy9q9999n"];
    
    BTPayPalDriver *payPalDriver = [[BTPayPalDriver alloc] initWithAPIClient:self.braintreeClient];
    
    BTPayPalCheckoutRequest *request = [[BTPayPalCheckoutRequest alloc] initWithAmount:amount];
    request.currencyCode = @"USD";
    
    [payPalDriver tokenizePayPalAccountWithPayPalRequest:request completion:^(BTPayPalAccountNonce * _Nullable tokenizedPayPalAccount, NSError * _Nullable error) {
      if (tokenizedPayPalAccount) {
        callback(@[@YES, tokenizedPayPalAccount.nonce]);
      } else if (error) {
        callback(@[@NO, @"error"]);
      } else {
        callback(@[@NO, @"cancel"]);
      }
    }];
  });
}

RCT_EXPORT_METHOD(showDropInUI:(NSString *)amount callback:(RCTResponseSenderBlock)callback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    BTDropInRequest *request = [[BTDropInRequest alloc] init];
    
    // ✅ DISABLE PayPal - only show card form
    request.paypalDisabled = YES;
    
    // Enable CVV and postal code collection
    request.cardholderNameSetting = BTFormFieldRequired;
    request.shouldMaskSecurityCode = YES;
    request.vaultManager = YES;
    
    BTDropInController *dropIn = [[BTDropInController alloc] 
      initWithAuthorization:@"sandbox_5rj7bnb5_ggbpfszgy9q9999n"
      request:request 
      handler:^(BTDropInController * _Nonnull controller, BTDropInResult * _Nullable result, NSError * _Nullable error) {
        if (error) {
          callback(@[@NO, error.localizedDescription]);
        } else if (result.canceled) {
          callback(@[@NO, @"cancel"]);
        } else {
          callback(@[@YES, result.paymentMethod.nonce]);
        }
        [controller dismissViewControllerAnimated:YES completion:nil];
      }];
    
    UIViewController *rootVC = [UIApplication sharedApplication].delegate.window.rootViewController;
    [rootVC presentViewController:dropIn animated:YES completion:nil];
  });
}

// Add this new method to PaymentManager.m
// ✅ RENAMED: tokenizeCard (was payWithCard)
RCT_EXPORT_METHOD(tokenizeCard:(NSString *)cardNumber
                  expirationMonth:(NSString *)expirationMonth
                  expirationYear:(NSString *)expirationYear
                  cvv:(NSString *)cvv
                  postalCode:(NSString *)postalCode
                  callback:(RCTResponseSenderBlock)callback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    self.braintreeClient = [[BTAPIClient alloc] initWithAuthorization:@"sandbox_5rj7bnb5_ggbpfszgy9q9999n"];
    
    BTCardClient *cardClient = [[BTCardClient alloc] initWithAPIClient:self.braintreeClient];
    
    // Braintree v5 API: Create card and set properties
    BTCard *card = [[BTCard alloc] init];
    card.number = cardNumber;
    card.expirationMonth = expirationMonth;
    card.expirationYear = expirationYear;
    card.cvv = cvv;
    
    // Optional but recommended for fraud protection
    if (postalCode && postalCode.length > 0) {
      card.postalCode = postalCode;
    }
    
    [cardClient tokenizeCard:card completion:^(BTCardNonce * _Nullable tokenizedCard, NSError * _Nullable error) {
      if (tokenizedCard) {
        NSLog(@"✅ Card tokenized successfully: %@", tokenizedCard.nonce);
        callback(@[@YES, tokenizedCard.nonce]);
      } else if (error) {
        NSString *errorMessage = error.localizedDescription ?: @"Card validation failed";
        NSLog(@"❌ Card tokenization failed: %@", errorMessage);
        callback(@[@NO, errorMessage]);
      } else {
        NSLog(@"❌ Card tokenization failed: Unknown error");
        callback(@[@NO, @"Unknown error occurred"]);
      }
    }];
  });
}

@end
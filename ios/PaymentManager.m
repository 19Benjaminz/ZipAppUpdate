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

// Drop-In UI for cards and PayPal
RCT_EXPORT_METHOD(showDropInUI:(NSString *)amount callback:(RCTResponseSenderBlock)callback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    BTDropInRequest *request = [[BTDropInRequest alloc] init];
    
    // Enable CVV and postal code collection
    request.cardholderNameSetting = BTFormFieldRequired;  // Ask for cardholder name
    // request.postalCodeSetting = BTFormFieldRequired; // Ask for postal code
    request.shouldMaskSecurityCode = YES;  // Mask CVV input
    
    // Enable postal code verification (AVS)
    request.vaultManager = YES;  // Required for some verification features
    
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

@end
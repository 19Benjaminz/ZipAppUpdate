// PaymentManager.h
#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <Braintree/BraintreePayPal.h>

@interface PaymentManager : NSObject <RCTBridgeModule, BTPayPalClientDelegate>
@end
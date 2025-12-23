package com.zipcodexpress1;

import androidx.appcompat.app.AppCompatActivity;
import android.util.Log;

import com.braintreepayments.api.BraintreeFragment;
import com.braintreepayments.api.PayPal;
import com.braintreepayments.api.Card;
import com.braintreepayments.api.exceptions.InvalidArgumentException;
import com.braintreepayments.api.interfaces.BraintreeCancelListener;
import com.braintreepayments.api.interfaces.BraintreeErrorListener;
import com.braintreepayments.api.interfaces.PaymentMethodNonceCreatedListener;
import com.braintreepayments.api.models.PayPalRequest;
import com.braintreepayments.api.models.PaymentMethodNonce;
import com.braintreepayments.api.models.CardBuilder;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Braintree payment module for React Native (v3 API)
 * Supports both PayPal and Credit Card payments
 */
public class PaymentManager extends ReactContextBaseJavaModule
    implements BraintreeCancelListener, BraintreeErrorListener, PaymentMethodNonceCreatedListener {
    
    private static final String TAG = "PaymentManager";
    private static final String BRAINTREE_TOKEN = "sandbox_5rj7bnb5_ggbpfszgy9q9999n";
    
    private BraintreeFragment mBraintreeFragment = null;
    private Callback payCallback;

    PaymentManager(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PaymentManager";
    }

    /**
     * PayPal payment method
     */
    @ReactMethod
    public void payWithAmount(String amount, final Callback callback) {
        Log.d(TAG, "payWithAmount called with amount: " + amount);
        payCallback = callback;
        
        try {
            mBraintreeFragment = BraintreeFragment.newInstance(
                    (AppCompatActivity) getCurrentActivity(),
                    BRAINTREE_TOKEN);
            mBraintreeFragment.addListener(this);
        } catch (InvalidArgumentException e) {
            Log.e(TAG, "Error creating BraintreeFragment for PayPal", e);
            onError(e);
            return;
        }

        PayPalRequest request = new PayPalRequest(amount).currencyCode("USD");
        PayPal.requestOneTimePayment(mBraintreeFragment, request);
    }

    /**
     * Credit Card tokenization method
     * @param cardNumber The card number (without spaces)
     * @param expirationMonth The expiration month (MM)
     * @param expirationYear The expiration year (YY)
     * @param cvv The CVV code
     * @param postalCode The postal/ZIP code (optional)
     * @param callback The callback to return the nonce or error
     */
    @ReactMethod
    public void tokenizeCard(String cardNumber, 
                           String expirationMonth, 
                           String expirationYear,
                           String cvv,
                           String postalCode,
                           final Callback callback) {
        Log.d(TAG, "tokenizeCard called");
        payCallback = callback;
        
        try {
            // Create BraintreeFragment
            mBraintreeFragment = BraintreeFragment.newInstance(
                    (AppCompatActivity) getCurrentActivity(),
                    BRAINTREE_TOKEN);
            mBraintreeFragment.addListener(this);
            
            // Build the card
            CardBuilder cardBuilder = new CardBuilder()
                    .cardNumber(cardNumber)
                    .expirationMonth(expirationMonth)
                    .expirationYear(expirationYear)
                    .cvv(cvv);
            
            // Add postal code if provided
            if (postalCode != null && !postalCode.isEmpty()) {
                cardBuilder.postalCode(postalCode);
            }
            
            Log.d(TAG, "Tokenizing card...");
            
            // Tokenize the card
            Card.tokenize(mBraintreeFragment, cardBuilder);
            
        } catch (InvalidArgumentException e) {
            Log.e(TAG, "Error creating BraintreeFragment for card tokenization", e);
            if (callback != null) {
                callback.invoke(false, "Failed to initialize payment: " + e.getMessage());
            }
        } catch (Exception e) {
            Log.e(TAG, "Error tokenizing card", e);
            if (callback != null) {
                callback.invoke(false, "Card validation failed: " + e.getMessage());
            }
        }
    }

    @Override
    public void onCancel(int requestCode) {
        Log.d(TAG, "Payment cancelled");
        if (payCallback != null) {
            payCallback.invoke(false, "cancel");
            payCallback = null;
        }
    }

    @Override
    public void onError(Exception error) {
        Log.e(TAG, "Payment error", error);
        if (payCallback != null) {
            String errorMessage = error.getMessage();
            if (errorMessage == null || errorMessage.isEmpty()) {
                errorMessage = "error";
            }
            payCallback.invoke(false, errorMessage);
            payCallback = null;
        }
    }

    @Override
    public void onPaymentMethodNonceCreated(PaymentMethodNonce paymentMethodNonce) {
        Log.d(TAG, "Payment method nonce created: " + paymentMethodNonce.getNonce());
        if (payCallback != null) {
            payCallback.invoke(true, paymentMethodNonce.getNonce());
            payCallback = null;
        }
    }
}
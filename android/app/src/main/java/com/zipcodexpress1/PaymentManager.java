package com.zipcodexpress1;

import androidx.appcompat.app.AppCompatActivity;

import com.braintreepayments.api.BraintreeFragment;
import com.braintreepayments.api.PayPal;
import com.braintreepayments.api.exceptions.InvalidArgumentException;
import com.braintreepayments.api.interfaces.BraintreeCancelListener;
import com.braintreepayments.api.interfaces.BraintreeErrorListener;
import com.braintreepayments.api.interfaces.PaymentMethodNonceCreatedListener;
import com.braintreepayments.api.models.PayPalRequest;
import com.braintreepayments.api.models.PaymentMethodNonce;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Braintree PayPal payment module for React Native (v3 API)
 */
public class PaymentManager extends ReactContextBaseJavaModule
    implements BraintreeCancelListener, BraintreeErrorListener, PaymentMethodNonceCreatedListener {
    private BraintreeFragment mBraintreeFragment = null;
    private Callback payCallback;

    PaymentManager(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "PayPal";
    }

    @ReactMethod
    public void payWithAmount(String amount, final Callback callback) {
        payCallback = callback;
        try {
            mBraintreeFragment = BraintreeFragment.newInstance(
                    (AppCompatActivity) getCurrentActivity(),
                    "sandbox_5rj7bnb5_ggbpfszgy9q9999n");
                    //"production_9qb7f6qw_pjmkcpqhmttyn2py");
            mBraintreeFragment.addListener(this);
        } catch (InvalidArgumentException e) {
            onError(e);
            return;
        }

        PayPalRequest request = new PayPalRequest(amount).currencyCode("USD");
        PayPal.requestOneTimePayment(mBraintreeFragment, request);
    }

    @Override
    public void onCancel(int requestCode) {
        if (payCallback != null) {
            payCallback.invoke(false, "cancel");
        }
    }

    @Override
    public void onError(Exception error) {
        if (payCallback != null) {
            payCallback.invoke(false, "error");
        }
    }

    @Override
    public void onPaymentMethodNonceCreated(PaymentMethodNonce paymentMethodNonce) {
        if (payCallback != null) {
            payCallback.invoke(true, paymentMethodNonce.getNonce());
        }
    }
}

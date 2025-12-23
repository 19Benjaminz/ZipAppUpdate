package com.zipcodexpress1;

import android.util.Log;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Package to register PaymentManager native module
 */
public class PaymentPackage implements ReactPackage {
    private static final String TAG = "PaymentPackage";
    
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        Log.d(TAG, "createNativeModules called");
        List<NativeModule> modules = new ArrayList<>();
        PaymentManager paymentManager = new PaymentManager(reactContext);
        Log.d(TAG, "PaymentManager created with name: " + paymentManager.getName());
        modules.add(paymentManager);
        return modules;
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
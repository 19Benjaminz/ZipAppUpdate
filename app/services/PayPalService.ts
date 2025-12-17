import { NativeModules, Platform } from 'react-native';

// Types for PayPal integration
export interface PayPalResult {
  success: boolean;
  nonce?: string;
  error?: string;
}

export interface PayPalConfig {
  environment: 'sandbox' | 'production';
  clientToken: string;
}

class PayPalService {
  private isInitialized = false;
  private braintreeModule: any = null;

  constructor() {
    this.initializeBraintree();
  }

  private async initializeBraintree() {
    try {
      // Check if PayPal module is available (matches old app's native module name)
      if (NativeModules.PayPal) {
        this.braintreeModule = NativeModules.PayPal;
        this.isInitialized = true;
        console.log('PayPal SDK initialized successfully');
      } else if (NativeModules.BraintreeDropIn) {
        // Fallback to Android module name if available
        this.braintreeModule = NativeModules.BraintreeDropIn;
        this.isInitialized = true;
        console.log('Braintree SDK initialized successfully');
      } else {
        console.warn('PayPal SDK not available - using fallback');
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Failed to initialize PayPal SDK:', error);
      this.isInitialized = false;
    }
  }

  /**
   * Initialize PayPal with client token from your backend
   */
  async initialize(config: PayPalConfig): Promise<boolean> {
    try {
      if (!this.isInitialized || !this.braintreeModule) {
        throw new Error('Braintree SDK not available');
      }

      // Initialize Braintree with client token
      await this.braintreeModule.setup(config.clientToken);
      console.log('PayPal initialized with client token');
      return true;
    } catch (error) {
      console.error('PayPal initialization failed:', error);
      return false;
    }
  }

  /**
   * Process PayPal payment
   */
  async processPayment(amount: number): Promise<PayPalResult> {
    try {
      // Validate amount
      if (!amount || amount <= 0) {
        return {
          success: false,
          error: 'Invalid amount provided'
        };
      }

      if (!this.isInitialized || !this.braintreeModule) {
        // Fallback for development/testing (Expo Go)
        console.log('[PayPal] Using simulation mode - PayPal SDK not available in Expo Go');
        return this.simulatePayPalPayment(amount);
      }

      // Call native PayPal module with amount
      // This matches the interface from both old iOS and Android implementations
      return new Promise((resolve) => {
        this.braintreeModule.payWithAmount(amount.toString(), (success: boolean, result: string) => {
          if (success) {
            resolve({
              success: true,
              nonce: result
            });
          } else {
            resolve({
              success: false,
              error: result // 'error' or 'cancel'
            });
          }
        });
      });
    } catch (error: any) {
      console.error('PayPal payment failed:', error);
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      };
    }
  }

  /**
   * Fallback simulation for development
   */
  private async simulatePayPalPayment(amount: number): Promise<PayPalResult> {
    return new Promise((resolve) => {
      // Validate amount for simulation
      if (!amount || amount <= 0) {
        resolve({
          success: false,
          error: 'Amount is required and must be greater than 0'
        });
        return;
      }

      // Simulate PayPal UI delay
      setTimeout(() => {
        // Generate mock nonce for testing
        const mockNonce = `mock_paypal_nonce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        console.log(`[SIMULATION] PayPal payment of $${amount} processed with nonce: ${mockNonce}`);
        console.log('[SIMULATION] This is a development simulation - no real payment was processed');
        
        resolve({
          success: true,
          nonce: mockNonce
        });
      }, 1500); // Reduced delay for better UX
    });
  }

  /**
   * Check if PayPal is available
   */
  isPayPalAvailable(): boolean {
    return this.isInitialized && this.braintreeModule !== null;
  }

  /**
   * Get Braintree environment info
   */
  getBraintreeInfo(): { available: boolean; platform: string } {
    return {
      available: this.isInitialized,
      platform: Platform.OS
    };
  }
}

// Export singleton instance
export const payPalService = new PayPalService();
export default PayPalService;
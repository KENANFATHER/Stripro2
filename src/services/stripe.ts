/**
 * Enhanced Stripe Service Configuration
 * 
 * This service handles Stripe.js initialization and provides utilities for
 * Stripe integration including payment processing and Stripe Connect flows.
 * Now supports dynamic API key management through user input.
 * 
 * Features:
 * - Dynamic Stripe.js initialization with user-provided keys
 * - Stripe Connect OAuth flow handling
 * - Payment processing utilities
 * - Local storage persistence for API keys
 * - Error handling and validation
 * 
 * Usage:
 * - Import stripePromise for Stripe.js instance
 * - Use StripeService for Connect and payment operations
 * - Call setApiKeys() to configure keys dynamically
 * - Call initializeStripeConnect for OAuth flows
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';

// Storage keys for persisting API keys
const STORAGE_KEYS = {
  PUBLISHABLE_KEY: 'stripe_publishable_key',
  CONNECT_CLIENT_ID: 'stripe_connect_client_id'
};

/**
 * Stripe Connect configuration
 */
const STRIPE_CONNECT_CONFIG = {
  // Stripe Connect OAuth endpoint
  authorizeUrl: 'https://connect.stripe.com/oauth/authorize',
  
  // OAuth scopes for Stripe Connect
  scope: 'read_write',
  
  // Response type for OAuth flow
  responseType: 'code',
  
  // Redirect URI pointing to Supabase Edge Function
  redirectUri: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-callback`,
};

/**
 * Enhanced Stripe Service Class
 * 
 * Provides methods for Stripe integration including Connect flows,
 * payment processing utilities, and dynamic API key management.
 */
export class StripeService {
  private stripe: Stripe | null = null;
  private publishableKey: string | null = null;
  private connectClientId: string | null = null;

  constructor() {
    this.loadStoredKeys();
    this.initializeStripe();
  }

  /**
   * Load API keys from localStorage and environment variables
   */
  private loadStoredKeys(): void {
    // Try to load from localStorage first
    this.publishableKey = localStorage.getItem(STORAGE_KEYS.PUBLISHABLE_KEY) || 
                         import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || null;
    
    this.connectClientId = localStorage.getItem(STORAGE_KEYS.CONNECT_CLIENT_ID) || 
                          import.meta.env.VITE_STRIPE_CONNECT_CLIENT_ID || null;
  }

  /**
   * Save API keys to localStorage
   */
  private saveKeys(): void {
    if (this.publishableKey) {
      localStorage.setItem(STORAGE_KEYS.PUBLISHABLE_KEY, this.publishableKey);
    }
    if (this.connectClientId) {
      localStorage.setItem(STORAGE_KEYS.CONNECT_CLIENT_ID, this.connectClientId);
    }
  }

  /**
   * Set Stripe API keys dynamically
   * 
   * @param publishableKey - Stripe publishable key
   * @param connectClientId - Stripe Connect client ID (optional)
   */
  async setApiKeys(publishableKey: string, connectClientId?: string): Promise<void> {
    try {
      // Validate publishable key format
      if (!this.validatePublishableKey(publishableKey)) {
        throw new Error('Invalid Stripe publishable key format. Key should start with pk_test_ or pk_live_');
      }

      // Validate Connect client ID format if provided
      if (connectClientId && !this.validateConnectClientId(connectClientId)) {
        throw new Error('Invalid Stripe Connect client ID format. ID should start with ca_');
      }

      // Update internal state
      this.publishableKey = publishableKey;
      if (connectClientId) {
        this.connectClientId = connectClientId;
      }

      // Save to localStorage
      this.saveKeys();

      // Reinitialize Stripe with new key
      await this.initializeStripe();

      console.log('Stripe API keys updated successfully');
    } catch (error) {
      console.error('Failed to set Stripe API keys:', error);
      throw error;
    }
  }

  /**
   * Get current API keys (masked for security)
   */
  getApiKeys(): {
    publishableKey: string | null;
    connectClientId: string | null;
    publishableKeyMasked: string | null;
    connectClientIdMasked: string | null;
  } {
    return {
      publishableKey: this.publishableKey,
      connectClientId: this.connectClientId,
      publishableKeyMasked: this.publishableKey ? this.maskKey(this.publishableKey) : null,
      connectClientIdMasked: this.connectClientId ? this.maskKey(this.connectClientId) : null,
    };
  }

  /**
   * Clear stored API keys
   */
  clearApiKeys(): void {
    this.publishableKey = null;
    this.connectClientId = null;
    localStorage.removeItem(STORAGE_KEYS.PUBLISHABLE_KEY);
    localStorage.removeItem(STORAGE_KEYS.CONNECT_CLIENT_ID);
    this.stripe = null;
  }

  /**
   * Validate Stripe publishable key format
   */
  private validatePublishableKey(key: string): boolean {
    return /^pk_(test|live)_[a-zA-Z0-9]{24,}$/.test(key);
  }

  /**
   * Validate Stripe Connect client ID format
   */
  private validateConnectClientId(clientId: string): boolean {
    return /^ca_[a-zA-Z0-9]{24,}$/.test(clientId);
  }

  /**
   * Mask API key for display (show first 8 and last 4 characters)
   */
  private maskKey(key: string): string {
    if (key.length <= 12) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  }

  /**
   * Initialize Stripe.js instance
   */
  private async initializeStripe(): Promise<void> {
    try {
      if (this.publishableKey) {
        this.stripe = await loadStripe(this.publishableKey);
        console.log('Stripe initialized successfully');
      } else {
        console.warn('No Stripe publishable key available for initialization');
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      this.stripe = null;
    }
  }

  /**
   * Get Stripe instance
   * 
   * @returns Promise with Stripe instance or null
   */
  async getStripe(): Promise<Stripe | null> {
    if (!this.stripe && this.publishableKey) {
      await this.initializeStripe();
    }
    return this.stripe;
  }

  /**
   * Initiate Stripe Connect OAuth flow
   * 
   * This redirects the user to Stripe's authorization page where they can
   * connect their Stripe account to your platform.
   * 
   * @param state - Optional state parameter for security
   * @returns Promise that resolves when redirect is initiated
   */
  async initiateStripeConnect(state?: string): Promise<void> {
    try {
      if (!this.connectClientId) {
        throw new Error(
          'Stripe Connect client ID not configured. Please add your Connect client ID in the Settings page. ' +
          'You can obtain this from your Stripe Dashboard under Connect settings.'
        );
      }

      if (!this.publishableKey) {
        throw new Error(
          'Stripe publishable key not configured. Please add your publishable key in the Settings page.'
        );
      }

      // Build OAuth URL parameters
      const params = new URLSearchParams({
        response_type: STRIPE_CONNECT_CONFIG.responseType,
        client_id: this.connectClientId,
        scope: STRIPE_CONNECT_CONFIG.scope,
        redirect_uri: STRIPE_CONNECT_CONFIG.redirectUri,
        ...(state && { state })
      });

      // Construct full OAuth URL
      const oauthUrl = `${STRIPE_CONNECT_CONFIG.authorizeUrl}?${params.toString()}`;

      // Log for debugging (remove in production)
      console.log('Initiating Stripe Connect OAuth flow:', {
        clientId: this.maskKey(this.connectClientId),
        redirectUri: STRIPE_CONNECT_CONFIG.redirectUri,
        scope: STRIPE_CONNECT_CONFIG.scope
      });

      // Redirect to Stripe OAuth page
      window.location.href = oauthUrl;

    } catch (error) {
      console.error('Failed to initiate Stripe Connect:', error);
      throw error;
    }
  }

  /**
   * Create a payment intent (for future payment processing)
   * 
   * @param amount - Amount in cents
   * @param currency - Currency code (default: 'usd')
   * @param metadata - Additional metadata
   * @returns Promise with payment intent client secret
   */
  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    metadata: Record<string, string> = {}
  ): Promise<string> {
    try {
      if (!this.publishableKey) {
        throw new Error('Stripe not configured. Please add your API keys in Settings.');
      }

      // This would typically call your backend API
      // For now, we'll return a mock client secret
      
      // TODO: Replace with actual backend API call
      // const response = await fetch('/api/stripe/create-payment-intent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount, currency, metadata })
      // });
      // const { client_secret } = await response.json();
      // return client_secret;

      console.log('Mock payment intent creation:', { amount, currency, metadata });
      return `pi_mock_${Date.now()}_secret_mock`;

    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment with Stripe Elements
   * 
   * @param clientSecret - Payment intent client secret
   * @param paymentMethod - Payment method or payment method ID
   * @returns Promise with payment result
   */
  async confirmPayment(
    clientSecret: string,
    paymentMethod: any
  ): Promise<any> {
    try {
      const stripe = await this.getStripe();
      
      if (!stripe) {
        throw new Error('Stripe not initialized. Please configure your API keys in Settings.');
      }

      const result = await stripe.confirmPayment({
        clientSecret,
        confirmParams: {
          payment_method: paymentMethod,
        },
      });

      return result;

    } catch (error) {
      console.error('Failed to confirm payment:', error);
      throw error;
    }
  }

  /**
   * Check if Stripe is properly configured
   * 
   * @returns Boolean indicating if Stripe is configured
   */
  isConfigured(): boolean {
    return !!this.publishableKey && !!this.connectClientId;
  }

  /**
   * Get Stripe configuration info (for debugging and UI display)
   * 
   * @returns Configuration information
   */
  getConfigInfo(): {
    isConfigured: boolean;
    hasPublishableKey: boolean;
    hasConnectClientId: boolean;
    keyType: 'test' | 'live' | 'unknown';
    keyPrefix: string;
    clientIdPrefix: string;
    publishableKeyMasked: string;
    connectClientIdMasked: string;
  } {
    const keyType = this.publishableKey?.startsWith('pk_test_') ? 'test' :
                   this.publishableKey?.startsWith('pk_live_') ? 'live' : 'unknown';

    return {
      isConfigured: !!this.publishableKey && !!this.connectClientId,
      hasPublishableKey: !!this.publishableKey,
      hasConnectClientId: !!this.connectClientId,
      keyType,
      keyPrefix: this.publishableKey ? this.publishableKey.substring(0, 20) + '...' : '',
      clientIdPrefix: this.connectClientId ? this.connectClientId.substring(0, 10) + '...' : '',
      publishableKeyMasked: this.publishableKey ? this.maskKey(this.publishableKey) : '',
      connectClientIdMasked: this.connectClientId ? this.maskKey(this.connectClientId) : '',
    };
  }

  /**
   * Test the current API key by making a simple request
   */
  async testApiKey(): Promise<{ valid: boolean; error?: string }> {
    try {
      if (!this.publishableKey) {
        return { valid: false, error: 'No API key configured' };
      }

      const stripe = await this.getStripe();
      if (!stripe) {
        return { valid: false, error: 'Failed to initialize Stripe' };
      }

      // For testing, we'll just check if Stripe initialized successfully
      // In a real implementation, you might make a test API call
      return { valid: true };

    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Export Stripe promise for components that need direct access
export const stripePromise = stripeService.getStripe();

/**
 * Utility function to format currency amounts
 * 
 * @param amount - Amount in cents
 * @param currency - Currency code
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

/**
 * Utility function to convert dollars to cents
 * 
 * @param dollars - Amount in dollars
 * @returns Amount in cents
 */
export const dollarsToCents = (dollars: number): number => {
  return Math.round(dollars * 100);
};

/**
 * Utility function to convert cents to dollars
 * 
 * @param cents - Amount in cents
 * @returns Amount in dollars
 */
export const centsToDollars = (cents: number): number => {
  return cents / 100;
};

/**
 * Example usage:
 * 
 * // Set API keys dynamically
 * import { stripeService } from '@/services/stripe';
 * 
 * const handleSaveApiKeys = async (publishableKey: string, connectClientId: string) => {
 *   try {
 *     await stripeService.setApiKeys(publishableKey, connectClientId);
 *     console.log('API keys saved successfully');
 *   } catch (error) {
 *     console.error('Failed to save API keys:', error);
 *   }
 * };
 * 
 * // Initialize Stripe Connect
 * const handleConnectStripe = async () => {
 *   try {
 *     await stripeService.initiateStripeConnect();
 *   } catch (error) {
 *     console.error('Stripe Connect failed:', error);
 *   }
 * };
 * 
 * // Check configuration
 * const config = stripeService.getConfigInfo();
 * console.log('Stripe config:', config);
 */
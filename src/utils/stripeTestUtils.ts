/**
 * Stripe Testing Utilities
 * 
 * This module provides helper functions for testing Stripe integration
 * in development environments. These utilities help simulate Stripe
 * events, validate configurations, and debug connection issues.
 * 
 * IMPORTANT: These utilities should only be used in development/testing
 * environments and should be excluded from production builds.
 */

import { stripeService } from '../services/stripe';

/**
 * Validate Stripe configuration
 * Tests if the current Stripe configuration is valid and working
 */
export async function validateStripeConfig(): Promise<{
  isValid: boolean;
  details: {
    hasPublishableKey: boolean;
    hasConnectClientId: boolean;
    publishableKeyValid: boolean;
    isTestMode: boolean;
  };
  errors: string[];
}> {
  const errors: string[] = [];
  const config = stripeService.getConfigInfo();
  
  // Test publishable key if available
  let publishableKeyValid = false;
  if (config.hasPublishableKey) {
    const keyTest = await stripeService.testApiKey();
    publishableKeyValid = keyTest.valid;
    if (!keyTest.valid && keyTest.error) {
      errors.push(`Publishable key error: ${keyTest.error}`);
    }
  } else {
    errors.push('Publishable key not configured');
  }
  
  // Check Connect client ID
  if (!config.hasConnectClientId) {
    errors.push('Connect client ID not configured');
  }
  
  return {
    isValid: publishableKeyValid && config.hasConnectClientId && errors.length === 0,
    details: {
      hasPublishableKey: config.hasPublishableKey,
      hasConnectClientId: config.hasConnectClientId,
      publishableKeyValid,
      isTestMode: config.keyType === 'test'
    },
    errors
  };
}

/**
 * Simulate Stripe webhook events for testing
 * This function helps test webhook handling without actual Stripe events
 */
export async function simulateWebhookEvent(
  eventType: 'customer.created' | 'payment_intent.succeeded' | 'charge.refunded',
  data: any
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Get Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }
    
    // Create mock event payload
    const mockEvent = {
      id: `evt_test_${Date.now()}`,
      object: 'event',
      api_version: '2023-10-16',
      created: Math.floor(Date.now() / 1000),
      data: {
        object: data
      },
      livemode: false,
      pending_webhooks: 0,
      request: {
        id: null,
        idempotency_key: null
      },
      type: eventType
    };
    
    // Send to webhook endpoint
    console.log(`Simulating Stripe webhook event: ${eventType}`);
    console.log('Event data:', mockEvent);
    
    // This would normally be sent to the webhook endpoint
    // In development, we'll just log it
    console.log('In production, this would be sent to:', `${supabaseUrl}/functions/v1/stripe-webhook`);
    
    return {
      success: true,
      message: 'Webhook event simulated (development only)'
    };
    
  } catch (error) {
    console.error('Error simulating webhook event:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Generate test customer data for Stripe
 */
export function generateTestCustomer(
  name: string = '',
  email: string = ''
): any {
  return {
    id: `cus_test_${Date.now()}`,
    object: 'customer',
    created: Math.floor(Date.now() / 1000),
    email,
    name,
    livemode: false,
    metadata: {
      test: 'true',
      created_by: 'stripe-test-utils'
    }
  };
}

/**
 * Generate test payment intent data for Stripe
 */
export function generateTestPaymentIntent(
  amount: number = 1000,
  currency: string = 'usd',
  customerId: string = `cus_test_${Date.now()}`
): any {
  return {
    id: `pi_test_${Date.now()}`,
    object: 'payment_intent',
    amount,
    currency,
    customer: customerId,
    created: Math.floor(Date.now() / 1000),
    status: 'succeeded',
    livemode: false,
    latest_charge: `ch_test_${Date.now()}`,
    metadata: {
      test: 'true',
      created_by: 'stripe-test-utils'
    }
  };
}

/**
 * Generate test charge data for Stripe
 */
export function generateTestCharge(
  amount: number = 1000,
  currency: string = 'usd',
  customerId: string = `cus_test_${Date.now()}`
): any {
  return {
    id: `ch_test_${Date.now()}`,
    object: 'charge',
    amount,
    currency,
    customer: customerId,
    created: Math.floor(Date.now() / 1000),
    status: 'succeeded',
    livemode: false,
    metadata: {
      test: 'true',
      created_by: 'stripe-test-utils'
    }
  };
}

/**
 * Generate test refund data for Stripe
 */
export function generateTestRefund(
  amount: number = 1000,
  currency: string = 'usd',
  chargeId: string = `ch_test_${Date.now()}`
): any {
  return {
    id: `re_test_${Date.now()}`,
    object: 'refund',
    amount,
    currency,
    charge: chargeId,
    created: Math.floor(Date.now() / 1000),
    status: 'succeeded',
    reason: 'requested_by_customer',
    livemode: false,
    metadata: {
      test: 'true',
      created_by: 'stripe-test-utils'
    }
  };
}

/**
 * Debug Stripe connection issues
 * This function helps identify common Stripe connection problems
 */
export async function debugStripeConnection(): Promise<{
  status: 'success' | 'warning' | 'error';
  message: string;
  details: Record<string, any>;
}> {
  try {
    // Check configuration
    const config = stripeService.getConfigInfo();
    const validation = await validateStripeConfig();
    
    // Check environment variables
    const envVars = {
      VITE_SUPABASE_URL: !!import.meta.env.VITE_SUPABASE_URL,
      VITE_SUPABASE_ANON_KEY: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      VITE_STRIPE_PUBLISHABLE_KEY: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      VITE_STRIPE_CONNECT_CLIENT_ID: !!import.meta.env.VITE_STRIPE_CONNECT_CLIENT_ID
    };
    
    // Check Edge Function URLs
    const edgeFunctionUrls = {
      connectCallback: `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/stripe-connect-callback`,
      webhook: `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/stripe-webhook`,
      profitability: `${import.meta.env.VITE_SUPABASE_URL || ''}/functions/v1/stripe-profitability`
    };
    
    // Determine overall status
    let status: 'success' | 'warning' | 'error' = 'success';
    let message = 'Stripe configuration is valid';
    
    if (!validation.isValid) {
      status = 'error';
      message = 'Stripe configuration is invalid';
    } else if (validation.details.isTestMode) {
      status = 'warning';
      message = 'Stripe is configured in test mode';
    }
    
    return {
      status,
      message,
      details: {
        config,
        validation,
        envVars,
        edgeFunctionUrls
      }
    };
    
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Test Stripe Edge Functions
 * This function tests the availability of Stripe-related Edge Functions
 */
export async function testEdgeFunctions(): Promise<{
  results: Record<string, {
    available: boolean;
    error?: string;
    responseTime?: number;
  }>;
  allAvailable: boolean;
}> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (!supabaseUrl) {
    return {
      results: {
        error: {
          available: false,
          error: 'Supabase URL not configured'
        }
      },
      allAvailable: false
    };
  }
  
  const functions = [
    'stripe-connect-callback',
    'stripe-webhook',
    'stripe-profitability',
    'stripe-disconnect'
  ];
  
  const results: Record<string, {
    available: boolean;
    error?: string;
    responseTime?: number;
  }> = {};
  
  for (const func of functions) {
    const startTime = performance.now();
    try {
      // Just check if the function exists by sending an OPTIONS request
      const response = await fetch(`${supabaseUrl}/functions/v1/${func}`, {
        method: 'OPTIONS',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const endTime = performance.now();
      
      results[func] = {
        available: response.ok || response.status === 204,
        responseTime: Math.round(endTime - startTime)
      };
      
      if (!results[func].available) {
        results[func].error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error) {
      results[func] = {
        available: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  const allAvailable = Object.values(results).every(r => r.available);
  
  return {
    results,
    allAvailable
  };
}
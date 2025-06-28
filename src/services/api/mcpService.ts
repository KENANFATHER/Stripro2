/**
 * MCP (Model Context Protocol) Service
 * 
 * This service handles communication with the custom Stripe MCP server running on ngrok
 * for Stripe operations and other external API integrations.
 * 
 * Features:
 * - Direct integration with custom Stripe MCP server
 * - Stripe customer, charge, and payment operations via MCP
 * - Error handling and retry logic
 * - Request/response logging
 * - Authentication and header management
 * 
 * Usage:
 * - Import mcpService for MCP operations
 * - Call mcpService.createStripeCustomer() for customer creation
 * - Call mcpService.createStripeCharge() for payments
 * - Use for other Stripe MCP tool integrations
 */

import { BaseApiService } from './base';

interface MCPToolRequest {
  name: string;
  arguments: Record<string, any>;
}

interface MCPToolResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

interface StripeCustomerRequest {
  email: string;
  name?: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface StripeCustomerResponse {
  id: string;
  email: string;
  name?: string;
  description?: string;
  created: number;
  metadata?: Record<string, string>;
}

interface StripeChargeRequest {
  amount: number;
  currency: string;
  source: string;
  customer?: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface StripeChargeResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customer?: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface StripePaymentIntentRequest {
  amount: number;
  currency: string;
  customer?: string;
  payment_method?: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface StripePaymentIntentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
  created: number;
  customer?: string;
  description?: string;
  metadata?: Record<string, string>;
}

class MCPService extends BaseApiService {
  private readonly MCP_BASE_URL = 'https://3ae9-2003-d8-b714-b6d1-84b8-1be2-7129-415f.ngrok-free.app';
  
  constructor() {
    super('https://3ae9-2003-d8-b714-b6d1-84b8-1be2-7129-415f.ngrok-free.app');
    
    // Add ngrok-specific headers and authentication
    this.addRequestInterceptor((config) => ({
      ...config,
      headers: {
        ...config.headers,
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Stripro-Dashboard/1.0',
        // Add any authentication headers if required by your MCP server
        // 'Authorization': 'Bearer your-api-key',
        // 'X-API-Key': 'your-api-key',
      }
    }));

    // Add response interceptor for better error handling
    this.addResponseInterceptor((response) => {
      console.log(`[MCP] Response received:`, response);
      return response;
    });

    // Add error interceptor for MCP-specific error handling
    this.addErrorInterceptor((error) => {
      console.error(`[MCP] Request failed:`, error);
      
      // Handle ngrok-specific errors
      if (error.message?.includes('ngrok')) {
        error.message = 'MCP server (ngrok tunnel) is not accessible. Please check if the tunnel is active.';
      }
      
      return error;
    });
  }

  /**
   * Execute a tool via MCP server
   * 
   * @param toolName - Name of the MCP tool to execute
   * @param args - Arguments for the tool
   * @returns Promise with tool response
   */
  async executeTool(toolName: string, args: Record<string, any>): Promise<MCPToolResponse> {
    try {
      console.log(`[MCP] Executing tool: ${toolName}`, args);
      
      const response = await this.post<MCPToolResponse>('/v1/tools/execute', {
        name: toolName,
        arguments: args
      });

      console.log(`[MCP] Tool response:`, response);
      return response;

    } catch (error) {
      console.error(`[MCP] Tool execution failed for ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Create a Stripe customer via MCP server
   * 
   * @param customerData - Stripe customer parameters
   * @returns Promise with customer result
   */
  async createStripeCustomer(customerData: StripeCustomerRequest): Promise<StripeCustomerResponse> {
    try {
      console.log('[MCP] Creating Stripe customer:', customerData);
      
      const response = await this.post<StripeCustomerResponse>('/v1/tools/stripe/customer', customerData);
      
      console.log('[MCP] Stripe customer created:', response);
      return response;

    } catch (error) {
      console.error('[MCP] Stripe customer creation failed:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe charge via MCP server
   * 
   * @param chargeData - Stripe charge parameters
   * @returns Promise with charge result
   */
  async createStripeCharge(chargeData: StripeChargeRequest): Promise<StripeChargeResponse> {
    try {
      console.log('[MCP] Creating Stripe charge:', chargeData);
      
      const response = await this.post<StripeChargeResponse>('/v1/tools/stripe/charge', chargeData);
      
      console.log('[MCP] Stripe charge created:', response);
      return response;

    } catch (error) {
      console.error('[MCP] Stripe charge failed:', error);
      throw error;
    }
  }

  /**
   * Create a Stripe payment intent via MCP server
   * 
   * @param paymentData - Stripe payment intent parameters
   * @returns Promise with payment intent result
   */
  async createStripePaymentIntent(paymentData: StripePaymentIntentRequest): Promise<StripePaymentIntentResponse> {
    try {
      console.log('[MCP] Creating Stripe payment intent:', paymentData);
      
      const response = await this.post<StripePaymentIntentResponse>('/v1/tools/stripe/payment-intent', paymentData);
      
      console.log('[MCP] Stripe payment intent created:', response);
      return response;

    } catch (error) {
      console.error('[MCP] Stripe payment intent failed:', error);
      throw error;
    }
  }

  /**
   * Get Stripe customer data via MCP server
   * 
   * @param customerId - Stripe customer ID
   * @returns Promise with customer data
   */
  async getStripeCustomer(customerId: string): Promise<StripeCustomerResponse> {
    try {
      const response = await this.executeTool('stripe/customer', {
        customer_id: customerId
      });

      if (response.isError) {
        throw new Error(response.content[0]?.text || 'Failed to get customer');
      }

      return JSON.parse(response.content[0]?.text || '{}');

    } catch (error) {
      console.error('[MCP] Get customer failed:', error);
      throw error;
    }
  }

  /**
   * List Stripe charges via MCP server
   * 
   * @param params - Query parameters for listing charges
   * @returns Promise with charges list
   */
  async listStripeCharges(params: {
    limit?: number;
    customer?: string;
    created?: {
      gte?: number;
      lte?: number;
    };
  } = {}): Promise<any> {
    try {
      const response = await this.get(`/v1/tools/stripe/charges${this.buildQueryString(params)}`);
      return response;

    } catch (error) {
      console.error('[MCP] List charges failed:', error);
      throw error;
    }
  }

  /**
   * List Stripe customers via MCP server
   * 
   * @param params - Query parameters for listing customers
   * @returns Promise with customers list
   */
  async listStripeCustomers(params: {
    limit?: number;
    email?: string;
    created?: {
      gte?: number;
      lte?: number;
    };
  } = {}): Promise<any> {
    try {
      const response = await this.get(`/v1/tools/stripe/customers${this.buildQueryString(params)}`);
      return response;

    } catch (error) {
      console.error('[MCP] List customers failed:', error);
      throw error;
    }
  }

  /**
   * Get Stripe balance via MCP server
   * 
   * @returns Promise with balance data
   */
  async getStripeBalance(): Promise<any> {
    try {
      const response = await this.get('/v1/tools/stripe/balance');
      return response;

    } catch (error) {
      console.error('[MCP] Get balance failed:', error);
      throw error;
    }
  }

  /**
   * Get Stripe account information via MCP server
   * 
   * @returns Promise with account data
   */
  async getStripeAccount(): Promise<any> {
    try {
      const response = await this.get('/v1/tools/stripe/account');
      return response;

    } catch (error) {
      console.error('[MCP] Get account failed:', error);
      throw error;
    }
  }

  /**
   * Test MCP server connection
   * 
   * @returns Promise with connection status
   */
  async testConnection(): Promise<{ connected: boolean; error?: string; serverInfo?: any }> {
    try {
      console.log('[MCP] Testing connection to:', this.MCP_BASE_URL);
      
      // Try to get server health/status
      const response = await this.get('/health');
      
      return { 
        connected: true, 
        serverInfo: response 
      };
    } catch (error) {
      console.error('[MCP] Connection test failed:', error);
      
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  /**
   * Get available MCP tools
   * 
   * @returns Promise with tools list
   */
  async getAvailableTools(): Promise<string[]> {
    try {
      const response = await this.get<{ tools: string[] }>('/v1/tools');
      return response.tools || [];
    } catch (error) {
      console.error('[MCP] Failed to get tools:', error);
      return [];
    }
  }

  /**
   * Get MCP server information
   * 
   * @returns Promise with server info
   */
  async getServerInfo(): Promise<any> {
    try {
      const response = await this.get('/v1/info');
      return response;
    } catch (error) {
      console.error('[MCP] Failed to get server info:', error);
      return null;
    }
  }

  /**
   * Refresh Stripe data via MCP server
   * 
   * @returns Promise with refresh status
   */
  async refreshStripeData(): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.post('/v1/tools/stripe/refresh', {});
      return { success: true, message: 'Stripe data refreshed successfully' };
    } catch (error) {
      console.error('[MCP] Stripe data refresh failed:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Refresh failed' 
      };
    }
  }

  /**
   * Get current MCP server URL
   * 
   * @returns Current server URL
   */
  getMCPServerUrl(): string {
    return this.MCP_BASE_URL;
  }

  /**
   * Update MCP server URL (for dynamic endpoint changes)
   * 
   * @param newUrl - New MCP server URL
   */
  updateMCPServerUrl(newUrl: string): void {
    // This would require reinitializing the service
    console.log('[MCP] Server URL update requested:', newUrl);
    // Implementation would depend on your specific needs
  }
}

// Export singleton instance
export const mcpService = new MCPService();
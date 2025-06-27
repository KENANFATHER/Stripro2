/**
 * MCP (Model Context Protocol) Service
 * 
 * This service handles communication with the MCP server running on ngrok
 * for Stripe operations and other external API integrations.
 * 
 * Features:
 * - Direct integration with MCP server
 * - Stripe charge operations via MCP
 * - Error handling and retry logic
 * - Request/response logging
 * 
 * Usage:
 * - Import mcpService for MCP operations
 * - Call mcpService.createStripeCharge() for payments
 * - Use for other MCP tool integrations
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

interface StripeChargeRequest {
  amount: number;
  currency: string;
  source: string;
  description?: string;
  metadata?: Record<string, string>;
}

interface StripeChargeResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  description?: string;
  metadata?: Record<string, string>;
}

class MCPService extends BaseApiService {
  private readonly MCP_BASE_URL = 'https://1b42-2003-d8-b714-b682-6d5d-e6d3-14a6-5275.ngrok-free.app';
  
  constructor() {
    super('https://1b42-2003-d8-b714-b682-6d5d-e6d3-14a6-5275.ngrok-free.app');
    
    // Add ngrok-specific headers
    this.addRequestInterceptor((config) => ({
      ...config,
      headers: {
        ...config.headers,
        'ngrok-skip-browser-warning': 'true',
        'Content-Type': 'application/json'
      }
    }));
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
   * Get Stripe customer data via MCP server
   * 
   * @param customerId - Stripe customer ID
   * @returns Promise with customer data
   */
  async getStripeCustomer(customerId: string): Promise<any> {
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
      const response = await this.executeTool('stripe/charges', params);

      if (response.isError) {
        throw new Error(response.content[0]?.text || 'Failed to list charges');
      }

      return JSON.parse(response.content[0]?.text || '{}');

    } catch (error) {
      console.error('[MCP] List charges failed:', error);
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
      const response = await this.executeTool('stripe/balance', {});

      if (response.isError) {
        throw new Error(response.content[0]?.text || 'Failed to get balance');
      }

      return JSON.parse(response.content[0]?.text || '{}');

    } catch (error) {
      console.error('[MCP] Get balance failed:', error);
      throw error;
    }
  }

  /**
   * Test MCP server connection
   * 
   * @returns Promise with connection status
   */
  async testConnection(): Promise<{ connected: boolean; error?: string }> {
    try {
      const response = await this.get('/health');
      return { connected: true };
    } catch (error) {
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
}

// Export singleton instance
export const mcpService = new MCPService();
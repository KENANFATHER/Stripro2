/**
 * Client REST API Service
 * 
 * This service handles all client-related API operations using REST endpoints.
 * It provides methods for client management, analytics, and profitability tracking.
 * 
 * Features:
 * - Client CRUD operations
 * - Client analytics and insights
 * - Profitability calculations via Supabase Edge Functions
 * - Client search and filtering
 * - Bulk operations
 * 
 * Usage:
 * - Import clientService in components
 * - Call methods like clientService.getClients()
 * - Handle responses and errors appropriately
 */

import { BaseApiService } from '../base';
import {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
  ClientAnalytics,
  QueryParams,
  ListResponse,
  BulkOperationResult,
  DashboardStats
} from '../types';

/**
 * Client Service Class
 * 
 * Extends BaseApiService to provide client-specific functionality.
 * All methods include detailed comments on how to replace mock data
 * with real API calls.
 */
class ClientService extends BaseApiService {
  constructor() {
    super(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');
  }

  /**
   * Get all clients with optional filtering and pagination
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with list of clients
   */
  async getClients(params: QueryParams = {}): Promise<ListResponse<Client>> {
    try {
      // Return empty client list as primary data comes from Edge Functions
      return {
        items: [],
        total: 0,
        page: 1,
        limit: params.limit || 50,
        hasMore: false
      };

    } catch (error) {
      console.error('Error fetching clients:', error);
      // Return empty client list to prevent UI crashes
      return {
        items: [],
        total: 0,
        page: 1,
        limit: params.limit || 50,
        hasMore: false
      };
    }
  }

  /**
   * Get a single client by ID
   * 
   * @param id - Client ID
   * @returns Promise with client data
   */
  async getClient(id: string): Promise<Client> {
    try {
      const client = await this.get<Client>(`/clients/${id}`);
      return client;

    } catch (error) {
      console.error('Error fetching client:', error);
      throw error;
    }
  }

  /**
   * Create a new client
   * 
   * @param clientData - Client creation payload
   * @returns Promise with created client
   */
  async createClient(clientData: CreateClientPayload): Promise<Client> {
    try {
      const client = await this.post<Client>('/clients', clientData);
      return client;

    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  }

  /**
   * Update an existing client
   * 
   * @param id - Client ID
   * @param clientData - Client update payload
   * @returns Promise with updated client
   */
  async updateClient(id: string, clientData: UpdateClientPayload): Promise<Client> {
    try {
      const client = await this.put<Client>(`/clients/${id}`, clientData);
      return client;

    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  }

  /**
   * Delete a client
   * 
   * @param id - Client ID
   * @returns Promise with success confirmation
   */
  async deleteClient(id: string): Promise<void> {
    try {
      await this.delete(`/clients/${id}`);

    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }

  /**
   * Get client analytics and insights
   * 
   * @param id - Client ID
   * @param period - Analysis period
   * @returns Promise with client analytics
   */
  async getClientAnalytics(id: string, period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<ClientAnalytics> {
    try {
      const analytics = await this.get<ClientAnalytics>(`/clients/${id}/analytics${this.buildQueryString({ period })}`);
      return analytics;

    } catch (error) {
      console.error('Error fetching client analytics:', error);
      throw error;
    }
  }

  /**
   * Bulk update multiple clients
   * 
   * @param updates - Array of client updates
   * @returns Promise with bulk operation result
   */
  async bulkUpdateClients(updates: Array<{ id: string; data: UpdateClientPayload }>): Promise<BulkOperationResult<Client>> {
    try {
      const result = await this.post<BulkOperationResult<Client>>('/clients/bulk', { updates });
      return result;

    } catch (error) {
      console.error('Error bulk updating clients:', error);
      throw error;
    }
  }

  /**
   * Search clients with advanced filtering
   * 
   * @param query - Search query
   * @param filters - Advanced filters
   * @returns Promise with search results
   */
  async searchClients(query: string, filters: Record<string, any> = {}): Promise<ListResponse<Client>> {
    try {
      const results = await this.post<ListResponse<Client>>('/clients/search', { query, filters });
      return results;

    } catch (error) {
      console.error('Error searching clients:', error);
      throw error;
    }
  }

  /**
   * Export clients data
   * 
   * @param format - Export format
   * @param filters - Export filters
   * @returns Promise with export URL
   */
  async exportClients(format: 'csv' | 'excel' | 'pdf' = 'csv', filters: QueryParams = {}): Promise<string> {
    try {
      const result = await this.post<{ downloadUrl: string }>('/clients/export', { format, filters });
      return result.downloadUrl;

    } catch (error) {
      console.error('Error exporting clients:', error);
      throw error;
    }
  }

  /**
   * Get client profitability data from Supabase Edge Function
   * 
   * @param stripeAccountId - Optional Stripe account ID for connected accounts
   * @returns Promise with profitability data from Edge Function
   */
  async getProfitabilityFromEdgeFunction(stripeAccountId?: string): Promise<Client[]> {
    try {
      console.log('[ClientService] Fetching profitability data from Supabase Edge Function...', 
        stripeAccountId ? `Using Stripe account: ${stripeAccountId}` : 'Using default account');
      
      // Get Supabase URL from environment variable with fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kcpgaavzznnvrnnvhdvo.supabase.co';
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/stripe-profitability`;

      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // Add authorization header if available
      if (import.meta.env.VITE_SUPABASE_ANON_KEY) {
        headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`;
      }
      
      // Add Stripe account header if provided
      if (stripeAccountId) {
        headers['X-Stripe-Account'] = stripeAccountId;
      }

      const response = await fetch(edgeFunctionUrl, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
        }
        throw new Error(errorData.error || 'Failed to fetch profitability data from Edge Function');
      }

      const data = await response.json();
      console.log('[ClientService] Edge Function response:', data);
      
      // Transform the Edge Function response to Client[] format if needed
      const clients = this.transformEdgeFunctionDataToClients(data);
      return clients;
      
    } catch (error) {
      console.error('[ClientService] Error calling Edge Function:', error);
      throw error;
    }
  }

  /**
   * Transform Edge Function response data to Client format
   */
  private transformEdgeFunctionDataToClients(data: any): Client[] {
    // If the Edge Function returns data in the expected Client[] format, return as-is
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        id: item.id || `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: item.name || item.customer_name || 'Unknown Client',
        email: item.email || item.customer_email || 'unknown@example.com',
        totalRevenue: item.totalRevenue || item.total_revenue || item.revenue || 0,
        stripeFees: item.stripeFees || item.stripe_fees || item.fees || 0,
        netProfit: item.netProfit || item.net_profit || item.profit || 0,
        transactionCount: item.transactionCount || item.transaction_count || item.transactions || 0,
        lastTransaction: item.lastTransaction || item.last_transaction || new Date().toISOString().split('T')[0],
        status: (item.status as 'active' | 'inactive') || 'active'
      }));
    }
    
    // If the Edge Function returns a different format, handle it here
    if (data.clients) {
      return this.transformEdgeFunctionDataToClients(data.clients);
    }
    
    // If it's a single object, wrap it in an array
    if (data && typeof data === 'object') {
      return this.transformEdgeFunctionDataToClients([data]);
    }
    
    // Return empty array if no valid data
    return [];
  }

  /**
   * Get dashboard statistics
   * 
   * @returns Promise with dashboard stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Return default stats as primary data comes from Edge Functions
      return {
        totalRevenue: 0,
        totalFees: 0,
        netProfit: 0,
        activeClients: 0,
        monthlyGrowth: 0,
        transactionCount: 0,
        averageTransactionValue: 0
      };

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats to prevent UI crashes
      return {
        totalRevenue: 0,
        totalFees: 0,
        netProfit: 0,
        activeClients: 0,
        monthlyGrowth: 0,
        transactionCount: 0,
        averageTransactionValue: 0
      };
    }
  }
}

// Export singleton instance
export const clientService = new ClientService();
/**
 * Client REST API Service
 * 
 * This service handles all client-related API operations using REST endpoints.
 * It provides methods for client management, analytics, and profitability tracking.
 * 
 * Features:
 * - Client CRUD operations
 * - Client analytics and insights
 * - Profitability calculations
 * - Client search and filtering
 * - Bulk operations
 * 
 * Usage:
 * - Import clientService in components
 * - Call methods like clientService.getClients()
 * - Handle responses and errors appropriately
 * 
 * How to swap dummy data with real API calls:
 * 1. Replace mock implementations with actual HTTP requests
 * 2. Update endpoint URLs to match your backend API
 * 3. Configure Stripe integration for real transaction data
 * 4. Handle real error responses from your API
 * 5. Update response data mapping if needed
 */

import { BaseApiService } from '../base';
import { mcpService } from '../mcpService';
import {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
  ClientAnalytics,
  QueryParams,
  ListResponse,
  BulkOperationResult
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
      // Try custom Stripe MCP server first, fallback to regular API
      try {
        console.log('[ClientService] Attempting to fetch data from custom MCP server...');
        
        // Get both customers and charges from the custom MCP server
        const [customersResponse, chargesResponse] = await Promise.all([
          mcpService.listStripeCustomers({
            limit: params.limit || 50
          }),
          mcpService.listStripeCharges({
            limit: params.limit || 100
          })
        ]);
        
        console.log('[ClientService] MCP server responses:', { customersResponse, chargesResponse });
        
        // Transform MCP response to client format
        const clients = this.transformMCPDataToClients(customersResponse, chargesResponse);
        
        return {
          items: clients,
          total: clients.length,
          page: 1,
          limit: params.limit || 50,
          hasMore: false
        };
      } catch (mcpError) {
        console.warn('[ClientService] Custom MCP server failed, using fallback data:', mcpError);
        // Return empty client list instead of making another failing API call
        return {
          items: [],
          total: 0,
          page: 1,
          limit: params.limit || 50,
          hasMore: false
        };
      }

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
   * @returns Promise with profitability data from Edge Function
   */
  async getProfitabilityFromEdgeFunction(): Promise<Client[]> {
    try {
      console.log('[ClientService] Fetching profitability data from Supabase Edge Function...');
      
      // Get Supabase URL from environment variable with fallback
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kcpgaavzznnvrnnvhdvo.supabase.co';
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/stripe-profitability`;

      const response = await fetch(edgeFunctionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Add authorization header if available
          ...(import.meta.env.VITE_SUPABASE_ANON_KEY && {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
          }),
          // If your Edge Function requires authentication (e.g., a JWT),
          // you would add an 'Authorization' header here.
          // For now, assuming it's publicly accessible as per the plan's --no-verify-jwt flag.
        },
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
      // Return empty array instead of throwing to prevent UI crashes
      return [];
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
      // Try to get real data from custom MCP server
      try {
        console.log('[ClientService] Fetching dashboard stats from custom MCP server...');
        
        const [balance, charges, customers] = await Promise.all([
          mcpService.getStripeBalance(),
          mcpService.listStripeCharges({ limit: 100 }),
          mcpService.listStripeCustomers({ limit: 100 })
        ]);
        
        // Transform MCP data to dashboard stats
        const stats = this.transformMCPDataToStats(balance, charges, customers);
        return stats;
      } catch (mcpError) {
        console.warn('[ClientService] Custom MCP server stats failed, using fallback:', mcpError);
        // Return default stats instead of making another failing API call
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

  /**
   * Transform custom MCP Stripe data to client format
   */
  private transformMCPDataToClients(customersData: any, chargesData: any): Client[] {
    console.log('[ClientService] Transforming MCP data to clients:', { customersData, chargesData });
    
    if (!customersData?.data && !chargesData?.data) return [];
    
    const customers = customersData?.data || [];
    const charges = chargesData?.data || [];
    
    // Group charges by customer and calculate totals
    const customerMap = new Map<string, any>();
    
    charges.forEach((charge: any) => {
      const customerId = charge.customer || 'unknown';
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: `Customer ${customerId.substring(0, 8)}`,
          email: `customer-${customerId.substring(0, 8)}@example.com`,
          charges: [],
          totalAmount: 0,
          totalFees: 0
        });
      }
      
      const customer = customerMap.get(customerId);
      customer.charges.push(charge);
      customer.totalAmount += charge.amount || 0;
      customer.totalFees += (charge.amount || 0) * 0.029 + 30; // Stripe fee calculation
    });
    
    // Convert to Client objects with enhanced data
    const clients: Client[] = [];
    let index = 1;
    
    customerMap.forEach((customerData, customerId) => {
      const client: Client = {
        id: customerData.id,
        name: customerData.name,
        email: customerData.email,
        totalRevenue: customerData.totalAmount / 100, // Convert from cents
        stripeFees: customerData.totalFees / 100,
        netProfit: (customerData.totalAmount - customerData.totalFees) / 100,
        transactionCount: customerData.charges.length,
        lastTransaction: customerData.charges[0]?.created ? 
          new Date(customerData.charges[0].created * 1000).toISOString().split('T')[0] : 
          new Date().toISOString().split('T')[0],
        status: 'active' as const
      };
      clients.push(client);
      index++;
    });
    
    return clients;
  }

  /**
   * Transform custom MCP data to dashboard stats
   */
  private transformMCPDataToStats(balance: any, charges: any, customers: any): DashboardStats {
    console.log('[ClientService] Transforming MCP data to stats:', { balance, charges, customers });
    
    const chargesData = charges?.data || [];
    const customersData = customers?.data || [];
    
    const totalRevenue = chargesData.reduce((sum: number, charge: any) => sum + (charge.amount || 0), 0) / 100;
    const totalFees = chargesData.reduce((sum: number, charge: any) => sum + ((charge.amount || 0) * 0.029 + 30), 0) / 100;
    const netProfit = totalRevenue - totalFees;
    const activeCustomers = customersData.length;
    
    return {
      totalRevenue,
      totalFees,
      netProfit,
      activeClients: activeCustomers,
      monthlyGrowth: 12.5, // Default value
      transactionCount: chargesData.length,
      averageTransactionValue: chargesData.length > 0 ? totalRevenue / chargesData.length : 0
    };
  }
}

// Export singleton instance
export const clientService = new ClientService();

/**
 * Example of how to use the ClientService:
 * 
 * // Get all clients with filtering
 * const clients = await clientService.getClients({
 *   search: 'acme',
 *   status: 'active',
 *   industry: 'technology',
 *   page: 1,
 *   limit: 10,
 *   sortBy: 'totalRevenue',
 *   sortOrder: 'desc'
 * });
 * 
 * // Get specific client
 * const client = await clientService.getClient('client-id');
 * 
 * // Create new client
 * const newClient = await clientService.createClient({
 *   name: 'New Company',
 *   email: 'contact@newcompany.com',
 *   industry: 'Technology',
 *   companySize: 'startup'
 * });
 * 
 * // Get client analytics
 * const analytics = await clientService.getClientAnalytics('client-id', 'month');
 * 
 * // Bulk update clients
 * const result = await clientService.bulkUpdateClients([
 *   { id: 'client-1', data: { status: 'inactive' } },
 *   { id: 'client-2', data: { tags: ['priority'] } }
 * ]);
 */
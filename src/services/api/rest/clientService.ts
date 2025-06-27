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
      // Try MCP server first, fallback to regular API
      try {
        const mcpResponse = await mcpService.listStripeCharges({
          limit: params.limit || 50
        });
        
        // Transform MCP response to client format
        const clients = this.transformMCPDataToClients(mcpResponse);
        return {
          items: clients,
          total: clients.length,
          page: 1,
          limit: params.limit || 50,
          hasMore: false
        };
      } catch (mcpError) {
        console.warn('[ClientService] MCP fallback failed, using regular API:', mcpError);
        const response = await this.get<ListResponse<Client>>(`/clients${this.buildQueryString(params)}`);
        return response;
      }

    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
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
   * Get dashboard statistics
   * 
   * @returns Promise with dashboard stats
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Try to get real data from MCP server
      try {
        const balance = await mcpService.getStripeBalance();
        const charges = await mcpService.listStripeCharges({ limit: 100 });
        
        // Transform MCP data to dashboard stats
        const stats = this.transformMCPDataToStats(balance, charges);
        return stats;
      } catch (mcpError) {
        console.warn('[ClientService] MCP stats fallback failed:', mcpError);
        const stats = await this.get<DashboardStats>('/dashboard/stats');
        return stats;
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Transform MCP Stripe data to client format
   */
  private transformMCPDataToClients(mcpData: any): Client[] {
    if (!mcpData?.data) return [];
    
    // Group charges by customer
    const customerMap = new Map<string, any>();
    
    mcpData.data.forEach((charge: any) => {
      const customerId = charge.customer || 'unknown';
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
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
    
    // Convert to Client objects
    const clients: Client[] = [];
    let index = 1;
    
    customerMap.forEach((data, customerId) => {
      const client: Client = {
        id: customerId,
        name: `Client ${index}`,
        email: `client${index}@example.com`,
        totalRevenue: data.totalAmount / 100, // Convert from cents
        stripeFees: data.totalFees / 100,
        netProfit: (data.totalAmount - data.totalFees) / 100,
        transactionCount: data.charges.length,
        lastTransaction: data.charges[0]?.created ? new Date(data.charges[0].created * 1000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: 'active' as const
      };
      clients.push(client);
      index++;
    });
    
    return clients;
  }

  /**
   * Transform MCP data to dashboard stats
   */
  private transformMCPDataToStats(balance: any, charges: any): DashboardStats {
    const chargesData = charges?.data || [];
    
    const totalRevenue = chargesData.reduce((sum: number, charge: any) => sum + (charge.amount || 0), 0) / 100;
    const totalFees = chargesData.reduce((sum: number, charge: any) => sum + ((charge.amount || 0) * 0.029 + 30), 0) / 100;
    const netProfit = totalRevenue - totalFees;
    
    return {
      totalRevenue,
      totalFees,
      netProfit,
      activeClients: new Set(chargesData.map((charge: any) => charge.customer)).size,
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
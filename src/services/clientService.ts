/**
 * Client Service
 * 
 * This service handles all client-related API operations including
 * fetching client data, managing client profiles, and calculating
 * profitability metrics.
 * 
 * Features:
 * - Client CRUD operations
 * - Profitability calculations
 * - Client search and filtering
 * - Revenue analytics
 * - Transaction aggregation
 * 
 * Usage:
 * - Import clientService in components
 * - Call methods like clientService.getClients()
 * - Handle responses for data display
 * 
 * Future enhancements:
 * - Replace mock data with Supabase queries
 * - Add real-time client updates
 * - Implement client segmentation
 */

import { apiClient, handleApiError } from './apiUtils';
import { Client, Transaction, DashboardStats } from '../types';

class ClientService {
  /**
   * Fetch all clients with optional filtering
   */
  async getClients(filters?: {
    status?: 'active' | 'inactive';
    search?: string;
    sortBy?: keyof Client;
    sortOrder?: 'asc' | 'desc';
  }): Promise<Client[]> {
    try {
      const response = await apiClient.get<Client[]>('/clients', { params: filters });
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get a single client by ID
   */
  async getClient(id: string): Promise<Client> {
    try {
      const client = await apiClient.get<Client>(`/clients/${id}`);
      return client;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create a new client
   */
  async createClient(clientData: Omit<Client, 'id' | 'totalRevenue' | 'stripeFees' | 'netProfit' | 'transactionCount' | 'lastTransaction'>): Promise<Client> {
    try {
      const newClient = await apiClient.post<Client>('/clients', clientData);
      return newClient;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update an existing client
   */
  async updateClient(id: string, clientData: Partial<Client>): Promise<Client> {
    try {
      const updatedClient = await apiClient.put<Client>(`/clients/${id}`, clientData);
      return updatedClient;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Delete a client
   */
  async deleteClient(id: string): Promise<void> {
    try {
      await apiClient.delete(`/clients/${id}`);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const stats = await apiClient.get<DashboardStats>('/dashboard/stats');
      return stats;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const clientService = new ClientService();
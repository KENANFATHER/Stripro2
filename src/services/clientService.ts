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

// Mock data for development
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'billing@acme.com',
    totalRevenue: 25670.50,
    stripeFees: 770.12,
    netProfit: 24900.38,
    transactionCount: 34,
    lastTransaction: '2025-01-10',
    status: 'active'
  },
  {
    id: '2',
    name: 'TechStart Solutions',
    email: 'payments@techstart.io',
    totalRevenue: 18420.00,
    stripeFees: 533.58,
    netProfit: 17886.42,
    transactionCount: 28,
    lastTransaction: '2025-01-09',
    status: 'active'
  },
  {
    id: '3',
    name: 'Global Dynamics',
    email: 'finance@globaldynamics.com',
    totalRevenue: 32150.75,
    stripeFees: 962.52,
    netProfit: 31188.23,
    transactionCount: 45,
    lastTransaction: '2025-01-08',
    status: 'active'
  },
  {
    id: '4',
    name: 'Creative Studio',
    email: 'hello@creativestudio.design',
    totalRevenue: 12890.25,
    stripeFees: 374.62,
    netProfit: 12515.63,
    transactionCount: 19,
    lastTransaction: '2025-01-05',
    status: 'inactive'
  },
  {
    id: '5',
    name: 'DataFlow Inc',
    email: 'accounting@dataflow.co',
    totalRevenue: 41230.80,
    stripeFees: 1198.69,
    netProfit: 40032.11,
    transactionCount: 67,
    lastTransaction: '2025-01-11',
    status: 'active'
  }
];

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
      // TODO: Replace with actual API call
      // const response = await apiClient.get<Client[]>('/clients', { params: filters });
      
      // Mock implementation with filtering
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredClients = [...mockClients];
      
      if (filters?.status) {
        filteredClients = filteredClients.filter(client => client.status === filters.status);
      }
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredClients = filteredClients.filter(client =>
          client.name.toLowerCase().includes(searchTerm) ||
          client.email.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters?.sortBy) {
        filteredClients.sort((a, b) => {
          const aValue = a[filters.sortBy!];
          const bValue = b[filters.sortBy!];
          
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
          }
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return filters.sortOrder === 'desc' 
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }
          
          return 0;
        });
      }
      
      return filteredClients;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get a single client by ID
   */
  async getClient(id: string): Promise<Client> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get<Client>(`/clients/${id}`);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const client = mockClients.find(c => c.id === id);
      if (!client) {
        throw new Error('Client not found');
      }
      
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
      // TODO: Replace with actual API call
      // const response = await apiClient.post<Client>('/clients', clientData);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newClient: Client = {
        ...clientData,
        id: Math.random().toString(36).substr(2, 9),
        totalRevenue: 0,
        stripeFees: 0,
        netProfit: 0,
        transactionCount: 0,
        lastTransaction: new Date().toISOString().split('T')[0]
      };
      
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
      // TODO: Replace with actual API call
      // const response = await apiClient.put<Client>(`/clients/${id}`, clientData);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const existingClient = mockClients.find(c => c.id === id);
      if (!existingClient) {
        throw new Error('Client not found');
      }
      
      const updatedClient: Client = {
        ...existingClient,
        ...clientData,
        id // Ensure ID doesn't change
      };
      
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
      // TODO: Replace with actual API call
      // await apiClient.delete(`/clients/${id}`);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const clientIndex = mockClients.findIndex(c => c.id === id);
      if (clientIndex === -1) {
        throw new Error('Client not found');
      }
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get<DashboardStats>('/dashboard/stats');
      
      // Mock implementation with calculated stats
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const totalRevenue = mockClients.reduce((sum, client) => sum + client.totalRevenue, 0);
      const totalFees = mockClients.reduce((sum, client) => sum + client.stripeFees, 0);
      const netProfit = totalRevenue - totalFees;
      const activeClients = mockClients.filter(client => client.status === 'active').length;
      const totalTransactions = mockClients.reduce((sum, client) => sum + client.transactionCount, 0);
      
      const stats: DashboardStats = {
        totalRevenue,
        totalFees,
        netProfit,
        activeClients,
        monthlyGrowth: 12.5,
        transactionCount: totalTransactions,
        averageTransactionValue: totalRevenue / totalTransactions
      };
      
      return stats;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export const clientService = new ClientService();
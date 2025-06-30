/**
 * Transaction REST API Service
 * 
 * This service handles all transaction-related API operations using REST endpoints.
 * It provides methods for transaction management, analytics, and financial reporting.
 * 
 * Features:
 * - Transaction CRUD operations
 * - Transaction analytics and reporting
 * - Payment processing integration
 * - Bulk transaction operations
 * - Real-time transaction monitoring
 * 
 * Usage:
 * - Import transactionService in components
 * - Call methods like transactionService.getTransactions()
 * - Handle responses and errors appropriately
 * 
 * How to swap dummy data with real API calls:
 * 1. Replace mock implementations with actual HTTP requests
 * 2. Update endpoint URLs to match your backend API
 * 3. Integrate with Stripe API for real transaction data
 * 4. Handle real payment processing workflows
 * 5. Update response data mapping if needed
 */

import { BaseApiService } from '../base';
import {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  TransactionAnalytics,
  QueryParams,
  ListResponse,
  BulkOperationResult
} from '../types';

/**
 * Transaction Service Class
 * 
 * Extends BaseApiService to provide transaction-specific functionality.
 * All methods include detailed comments on how to replace mock data
 * with real API calls.
 */
class TransactionService extends BaseApiService {
  constructor() {
    super(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');
  }

  /**
   * Get all transactions with optional filtering and pagination
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with list of transactions
   * 
   * How to implement with real API:
   * 1. Remove mock data and use this.get() method
   * 2. Update endpoint to match your API: '/transactions'
   * 3. Handle real pagination and filtering on backend
   * 4. Integrate with Stripe webhooks for real-time data
   * 5. Map response data to Transaction interface if needed
   */
  async getTransactions(params: QueryParams = {}): Promise<ListResponse<Transaction>> {
    try {
      const response = await this.get<ListResponse<Transaction>>(`/transactions${this.buildQueryString(params)}`);
      return response;

    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get a single transaction by ID
   * 
   * @param id - Transaction ID
   * @returns Promise with transaction data
   */
  async getTransaction(id: string): Promise<Transaction> {
    try {
      const transaction = await this.get<Transaction>(`/transactions/${id}`);
      return transaction;

    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  /**
   * Create a new transaction
   * 
   * @param transactionData - Transaction creation payload
   * @returns Promise with created transaction
   */
  async createTransaction(transactionData: CreateTransactionPayload): Promise<Transaction> {
    try {
      const transaction = await this.post<Transaction>('/transactions', transactionData);
      return transaction;

    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  /**
   * Update an existing transaction
   * 
   * @param id - Transaction ID
   * @param transactionData - Transaction update payload
   * @returns Promise with updated transaction
   */
  async updateTransaction(id: string, transactionData: UpdateTransactionPayload): Promise<Transaction> {
    try {
      const transaction = await this.put<Transaction>(`/transactions/${id}`, transactionData);
      return transaction;

    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  /**
   * Cancel a pending transaction
   * 
   * @param id - Transaction ID
   * @returns Promise with cancelled transaction
   */
  async cancelTransaction(id: string): Promise<Transaction> {
    try {
      const transaction = await this.post<Transaction>(`/transactions/${id}/cancel`);
      return transaction;

    } catch (error) {
      console.error('Error cancelling transaction:', error);
      throw error;
    }
  }

  /**
   * Refund a completed transaction
   * 
   * @param id - Transaction ID
   * @param amount - Refund amount (optional, defaults to full amount)
   * @param reason - Refund reason
   * @returns Promise with refunded transaction
   */
  async refundTransaction(id: string, amount?: number, reason?: string): Promise<Transaction> {
    try {
      const transaction = await this.post<Transaction>(`/transactions/${id}/refund`, { amount, reason });
      return transaction;

    } catch (error) {
      console.error('Error refunding transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction analytics
   * 
   * @param period - Analysis period
   * @param filters - Additional filters
   * @returns Promise with transaction analytics
   */
  async getTransactionAnalytics(
    period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month',
    filters: QueryParams = {}
  ): Promise<TransactionAnalytics> {
    try {
      const analytics = await this.get<TransactionAnalytics>(`/transactions/analytics${this.buildQueryString({ period, ...filters })}`);
      return analytics;

    } catch (error) {
      console.error('Error fetching transaction analytics:', error);
      throw error;
    }
  }

  /**
   * Bulk process transactions
   * 
   * @param operations - Array of transaction operations
   * @returns Promise with bulk operation result
   */
  async bulkProcessTransactions(
    operations: Array<{ action: 'cancel' | 'refund' | 'update'; id: string; data?: any }>
  ): Promise<BulkOperationResult<Transaction>> {
    try {
      const result = await this.post<BulkOperationResult<Transaction>>('/transactions/bulk', { operations });
      return result;

    } catch (error) {
      console.error('Error bulk processing transactions:', error);
      throw error;
    }
  }

  /**
   * Export transactions data
   * 
   * @param format - Export format
   * @param filters - Export filters
   * @returns Promise with export URL
   */
  async exportTransactions(format: 'csv' | 'excel' | 'pdf' = 'csv', filters: QueryParams = {}): Promise<string> {
    try {
      const result = await this.post<{ downloadUrl: string }>('/transactions/export', { format, filters });
      return result.downloadUrl;

    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const transactionService = new TransactionService();

/**
 * Example of how to use the TransactionService:
 * 
 * // Get all transactions with filtering
 * const transactions = await transactionService.getTransactions({
 *   status: 'completed',
 *   clientId: 'client-123',
 *   dateFrom: '2024-01-01',
 *   dateTo: '2024-01-31',
 *   page: 1,
 *   limit: 20,
 *   sortBy: 'transactionDate',
 *   sortOrder: 'desc'
 * });
 * 
 * // Get specific transaction
 * const transaction = await transactionService.getTransaction('txn-id');
 * 
 * // Create new transaction
 * const newTransaction = await transactionService.createTransaction({
 *   clientId: 'client-123',
 *   amount: 1999.99,
 *   description: 'Product Purchase',
 *   reference: 'ORDER-001'
 * });
 * 
 * // Process refund
 * const refundedTransaction = await transactionService.refundTransaction(
 *   'txn-id',
 *   999.99,
 *   'customer_request'
 * );
 * 
 * // Get analytics
 * const analytics = await transactionService.getTransactionAnalytics('month', {
 *   clientId: 'client-123'
 * });
 */
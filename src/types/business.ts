/**
 * Business domain TypeScript interfaces and types
 * 
 * This file contains all type definitions related to the core business logic,
 * including clients, transactions, and financial data structures.
 * 
 * Usage:
 * - Import these types in components that handle business data
 * - Use for API response typing and data validation
 * - Reference when building forms and data display components
 */

export interface Client {
  id: string;
  name: string;
  email: string;
  totalRevenue: number;
  stripeFees: number;
  netProfit: number;
  transactionCount: number;
  lastTransaction: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  stripeFee: number;
  netAmount: number;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  stripeTransactionId?: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalFees: number;
  netProfit: number;
  activeClients: number;
  monthlyGrowth: number;
  transactionCount: number;
  averageTransactionValue: number;
}

export interface FinancialMetrics {
  revenue: number;
  fees: number;
  profit: number;
  margin: number;
  period: string;
}
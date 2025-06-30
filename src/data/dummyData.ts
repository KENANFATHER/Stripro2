/**
 * Fallback Data for Development
 * 
 * This file contains fallback data that will be used if the API is unavailable.
 * The app now primarily uses real API data from the Stripe MCP server.
 * 
 * Usage:
 * - Used as fallback when API requests fail
 * - Provides sample data structure for development
 * - Can be used for offline development
 */

import { Client, DashboardStats } from '../types';

export const fallbackClients: Client[] = [
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

export const fallbackDashboardStats: DashboardStats = {
  totalRevenue: fallbackClients.reduce((sum, client) => sum + client.totalRevenue, 0),
  totalFees: fallbackClients.reduce((sum, client) => sum + client.stripeFees, 0),
  netProfit: fallbackClients.reduce((sum, client) => sum + client.netProfit, 0),
  activeClients: fallbackClients.filter(client => client.status === 'active').length,
  monthlyGrowth: 12.5,
  transactionCount: fallbackClients.reduce((sum, client) => sum + client.transactionCount, 0),
  averageTransactionValue: fallbackClients.reduce((sum, client) => sum + client.totalRevenue, 0) / fallbackClients.reduce((sum, client) => sum + client.transactionCount, 0)
};

// Keep the old exports for backward compatibility during transition
export const dummyClients = fallbackClients;
export const dashboardStats = fallbackDashboardStats;
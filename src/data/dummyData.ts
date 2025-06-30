/**
 * Fallback Data for Development
 * 
 * This file contains fallback data that will be used if the API is unavailable.
 * This file should be replaced with real data in production.
 * 
 * Usage:
 * - Used as fallback when API requests fail
 * - Provides sample data structure for development
 * - Can be used for offline development
 */

import { Client, DashboardStats } from '../types';

export const fallbackClients: Client[] = [];

export const fallbackDashboardStats: DashboardStats = {
  totalRevenue: 0,
  totalFees: 0,
  netProfit: 0,
  activeClients: 0,
  monthlyGrowth: 0,
  transactionCount: 0,
  averageTransactionValue: 0
};

// Keep the old exports for backward compatibility during transition
export const dummyClients = fallbackClients;
export const dashboardStats = fallbackDashboardStats;
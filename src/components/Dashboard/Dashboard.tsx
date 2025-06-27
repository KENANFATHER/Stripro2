/**
 * Dashboard Component
 * 
 * This component displays the main dashboard with key metrics and client data.
 * It shows revenue statistics, client profitability, and provides navigation
 * to detailed views.
 * 
 * Features:
 * - Revenue and profit metrics display
 * - Client profitability table
 * - Real-time data updates
 * - Responsive design for all devices
 * - Mobile-optimized layout
 * 
 * Usage:
 * - Used in DashboardPage component
 * - Displays overview of business metrics
 * - Provides quick access to client data
 */

import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Users, AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import StatsCard from './StatsCard';
import ClientTable from './ClientTable';
import { useApi } from '../../hooks';
import { clientService } from '../../services/api';
import { mcpService } from '../../services/api';
import { Client, DashboardStats } from '../../types';
import { fallbackClients, fallbackDashboardStats } from '../../data/dummyData';

const Dashboard: React.FC = () => {
  const [mcpConnected, setMcpConnected] = React.useState<boolean | null>(null);
  
  const { 
    data: clients, 
    loading: clientsLoading, 
    error: clientsError,
    execute: fetchClients 
  } = useApi<Client[]>();

  const { 
    data: stats, 
    loading: statsLoading, 
    error: statsError,
    execute: fetchStats 
  } = useApi<DashboardStats>();

  // Fetch data on component mount
  React.useEffect(() => {
    // Test MCP connection
    mcpService.testConnection().then(result => {
      setMcpConnected(result.connected);
      if (!result.connected) {
        console.warn('[Dashboard] MCP server not connected:', result.error);
      }
    });
    
    fetchClients(() => clientService.getClients().then(response => response.items));
    fetchStats(() => clientService.getDashboardStats());
  }, [fetchClients, fetchStats]);

  // Use fallback data if API fails
  const displayClients = clients || (clientsError ? fallbackClients : []);
  const displayStats = stats || (statsError ? fallbackDashboardStats : {
    totalRevenue: 0,
    totalFees: 0,
    netProfit: 0,
    activeClients: 0,
    monthlyGrowth: 0,
    transactionCount: 0,
    averageTransactionValue: 0
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-soft min-h-screen">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-coral-600 via-tangerine-600 to-lilac-600 bg-clip-text text-transparent mb-2">
          Dashboard
        </h1>
        <p className="text-sage-600 text-base sm:text-lg">
          Overview of your Stripe analytics and client profitability metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(displayStats.totalRevenue)}
          change="+12.5% from last month"
          changeType="positive"
          icon={DollarSign}
          iconColor="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatsCard
          title="Net Profit"
          value={formatCurrency(displayStats.netProfit)}
          change="+8.2% from last month"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-gradient-to-br from-coral-500 to-coral-600"
        />
        <StatsCard
          title="Stripe Fees"
          value={formatCurrency(displayStats.totalFees)}
          change="2.9% of revenue"
          changeType="neutral"
          icon={CreditCard}
          iconColor="bg-gradient-to-br from-tangerine-500 to-tangerine-600"
        />
        <StatsCard
          title="Active Clients"
          value={displayStats.activeClients.toString()}
          change="+2 this month"
          changeType="positive"
          icon={Users}
          iconColor="bg-gradient-to-br from-lilac-500 to-lilac-600"
        />
      </div>

      {/* Loading State */}
      {(clientsLoading || statsLoading) && (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-coral-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-sage-600">Loading dashboard data...</span>
        </div>
      )}

      {/* Error State */}
      {(clientsError || statsError) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-yellow-800 font-medium">
                {mcpConnected === false ? 'MCP server disconnected - Using fallback data' : 'Using fallback data'}
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                {mcpConnected === false 
                  ? 'Unable to connect to MCP server. Check if ngrok tunnel is active.'
                  : 'Unable to connect to the API server. Displaying sample data for demonstration.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* MCP Connection Status */}
      {mcpConnected !== null && (
        <div className={`rounded-xl p-4 mb-6 ${
          mcpConnected 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {mcpConnected ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
            <p className={`font-medium ${
              mcpConnected ? 'text-green-800' : 'text-red-800'
            }`}>
              MCP Server: {mcpConnected ? 'Connected' : 'Disconnected'}
            </p>
            {mcpConnected && (
              <span className="text-green-700 text-sm">
                (Real Stripe data via ngrok)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Client Table */}
      {!clientsLoading && (
        <div className="overflow-x-auto">
          <ClientTable clients={displayClients} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
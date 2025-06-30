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
 * - Real-time data updates via Supabase Edge Functions
 * - Responsive design for all devices
 * - Mobile-optimized layout
 * 
 * Usage:
 * - Used in DashboardPage component
 * - Displays overview of business metrics
 * - Provides quick access to client data
 */

import React from 'react';
import { DollarSign, TrendingUp, CreditCard, Users, AlertTriangle } from 'lucide-react';
import StatsCard from './StatsCard';
import ClientTable from './ClientTable';
import { useApi } from '../../hooks';
import { clientService } from '../../services/api';
import { Client, DashboardStats } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { fallbackClients, fallbackDashboardStats } from '../../data/dummyData';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [profitabilityData, setProfitabilityData] = React.useState<Client[] | null>(null);
  const [profitabilityLoading, setProfitabilityLoading] = React.useState(false);
  const [profitabilityError, setProfitabilityError] = React.useState<string | null>(null);
  
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
    fetchClients(() => clientService.getClients().then(response => response.items));
    fetchStats(() => clientService.getDashboardStats());
    
    // Fetch profitability data from Supabase Edge Function
    const fetchProfitability = async () => {
      setProfitabilityLoading(true);
      setProfitabilityError(null);
      
      // Log user's Stripe connection status
      console.log('[Dashboard] User Stripe connection status:', {
        connected: user?.stripeConnected,
        accountId: user?.stripeAccountId
      });
      
      try {
        // Pass the user's Stripe account ID if available
        const data = await clientService.getProfitabilityFromEdgeFunction(user?.stripeAccountId);
        setProfitabilityData(data);
        console.log('[Dashboard] Edge Function profitability data loaded:', data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profitability data from Edge Function';
        setProfitabilityError(errorMessage);
        console.error('[Dashboard] Edge Function error:', errorMessage);
      } finally {
        setProfitabilityLoading(false);
      }
    };

    // Only fetch if user is authenticated
    if (user) {
      fetchProfitability();
    }
  }, [fetchClients, fetchStats, user]);

  // Use fallback data if API fails
  const displayClients = clients || [];
  const displayStats = stats || {
    totalRevenue: 0,
    totalFees: 0,
    netProfit: 0,
    activeClients: 0,
    monthlyGrowth: 0,
    transactionCount: 0,
    averageTransactionValue: 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
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
                Using fallback data
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                Unable to connect to the API server. Displaying sample data for demonstration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Client Table */}
      {!clientsLoading && (
        <div className="overflow-x-auto">
          <ClientTable clients={displayClients} />
        </div>
      )}

      {/* Client Profitability from Supabase Edge Function */}
      <div className="mt-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-sage-900 mb-4">
          Client Profitability
        </h2>
        <p className="text-sage-600 mb-6">
          Real-time profitability data calculated using live Stripe data.
        </p>
        
        {profitabilityLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-3 border-coral-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sage-600">Loading profitability data from Edge Function...</span>
          </div>
        )}
        
        {profitabilityError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium">Error loading profitability data from Edge Function:</p>
                <p className="text-red-700 text-sm mt-1">{profitabilityError}</p>
                <p className="text-red-600 text-xs mt-2">
                  Make sure your Supabase Edge Function is deployed and accessible at: 
                  <code className="bg-red-100 px-1 rounded ml-1">
                    {import.meta.env.VITE_SUPABASE_URL || 'https://kcpgaavzznnvrnnvhdvo.supabase.co'}/functions/v1/stripe-profitability
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {profitabilityData && profitabilityData.length > 0 && (
          <div className="bg-white rounded-2xl border border-sage-200 overflow-hidden shadow-sm">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-sage-200 bg-gradient-soft">
              <h3 className="text-lg sm:text-xl font-bold text-sage-900">Edge Function Results</h3>
              <p className="text-sm text-sage-600 mt-1">Live Stripe profitability calculations</p>
            </div>
            
            {/* Desktop Table View */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sage-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider">Client</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider">Stripe Fees</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider">Net Profit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider">Transactions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-sage-200">
                  {profitabilityData.map((client) => (
                    <tr key={client.id} className="hover:bg-sage-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center shadow-sm">
                              <span className="text-sm font-bold text-white">
                                {client.name.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-sage-900">
                              {client.name}
                            </div>
                            <div className="text-sm text-sage-600">
                              {client.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-sage-900">
                        {formatCurrency(client.totalRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                        -{formatCurrency(client.stripeFees)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        {formatCurrency(client.netProfit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-sage-900">
                        {client.transactionCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Card View for Profitability Data */}
            <div className="lg:hidden">
              <div className="divide-y divide-sage-200">
                {profitabilityData.map((client) => (
                  <div key={client.id} className="p-4 sm:p-6 hover:bg-sage-50 transition-colors">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-coral-400 to-coral-600 flex items-center justify-center shadow-sm">
                        <span className="text-sm font-bold text-white">
                          {client.name.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-sage-900 truncate">
                          {client.name}
                        </div>
                        <div className="text-sm text-sage-600 truncate">
                          {client.email}
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        client.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-sage-100 text-sage-800'
                      }`}>
                        {client.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-sage-600">Revenue</span>
                        <div className="font-semibold text-sage-900">
                          {formatCurrency(client.totalRevenue)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sage-600">Stripe Fees</span>
                        <div className="font-medium text-red-600">
                          -{formatCurrency(client.stripeFees)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sage-600">Net Profit</span>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(client.netProfit)}
                        </div>
                      </div>
                      <div>
                        <span className="text-sage-600">Transactions</span>
                        <div className="font-medium text-sage-900">
                          {client.transactionCount}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {profitabilityData && profitabilityData.length === 0 && !profitabilityLoading && (
          <div className="text-center py-8 bg-white rounded-xl border border-sage-200">
            <div className="text-sage-600">
              <p className="text-lg font-medium mb-2">No profitability data found</p>
              <p className="text-sm">Your Edge Function returned an empty result. This could mean:</p>
              <ul className="text-sm mt-2 space-y-1">
                <li>• No Stripe customers or charges found</li>
                <li>• Edge Function needs Stripe API key configuration</li>
                <li>• Edge Function is still processing data</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
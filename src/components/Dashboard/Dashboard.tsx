import React, { useEffect, useState } from 'react';
import { StatsCard } from './StatsCard';
import ClientTable from './ClientTable';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../contexts/NotificationContext';
import { LoadingSpinner } from '../UI/LoadingSpinner';

interface DashboardStats {
  totalRevenue: number;
  totalClients: number;
  avgProfitMargin: number;
  monthlyGrowth: number;
}

interface Client {
  id: string;
  name: string;
  email: string;
  totalRevenue: number;
  profitMargin: number;
  lastTransaction: string;
  status: 'active' | 'inactive';
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { get } = useApi();
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics
        const statsResponse = await get('/api/dashboard/stats');
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        // Fetch recent clients
        const clientsResponse = await get('/api/clients?limit=10');
        if (clientsResponse.success) {
          setClients(clientsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        addNotification({
          type: 'error',
          message: 'Failed to load dashboard data. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [get, addNotification]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your client profitability and business metrics
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            change={stats.monthlyGrowth}
            changeType={stats.monthlyGrowth >= 0 ? 'increase' : 'decrease'}
            icon="dollar-sign"
          />
          <StatsCard
            title="Active Clients"
            value={stats.totalClients.toString()}
            change={5.2}
            changeType="increase"
            icon="users"
          />
          <StatsCard
            title="Avg Profit Margin"
            value={`${stats.avgProfitMargin.toFixed(1)}%`}
            change={2.1}
            changeType="increase"
            icon="trending-up"
          />
          <StatsCard
            title="Monthly Growth"
            value={`${stats.monthlyGrowth.toFixed(1)}%`}
            change={stats.monthlyGrowth}
            changeType={stats.monthlyGrowth >= 0 ? 'increase' : 'decrease'}
            icon="bar-chart"
          />
        </div>
      )}

      {/* Recent Clients Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Clients</h2>
          <p className="text-sm text-gray-600 mt-1">
            Your most recent client transactions and profitability data
          </p>
        </div>
        <ClientTable clients={clients} showActions={false} />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors">
            <div className="text-sm font-medium text-gray-900">Add New Data</div>
            <div className="text-xs text-gray-600 mt-1">Import or connect new client data</div>
          </button>
          <button className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors">
            <div className="text-sm font-medium text-gray-900">View All Clients</div>
            <div className="text-xs text-gray-600 mt-1">Manage your client portfolio</div>
          </button>
          <button className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-4 text-left transition-colors">
            <div className="text-sm font-medium text-gray-900">Generate Report</div>
            <div className="text-xs text-gray-600 mt-1">Export profitability analytics</div>
          </button>
        </div>
      </div>
    </div>
  );
};
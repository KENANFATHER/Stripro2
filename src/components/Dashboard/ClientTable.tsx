/**
 * Client Table Component
 * 
 * This component displays client data in a sortable table format.
 * It shows profitability metrics, client information, and status
 * with interactive sorting capabilities.
 * 
 * Features:
 * - Sortable columns for all metrics
 * - Client avatars and information display
 * - Status indicators
 * - Responsive design with mobile-friendly layout
 * - Hover effects
 * 
 * Usage:
 * - Used in dashboard to display client list
 * - Pass clients array as prop
 * - Handles sorting internally
 * 
 * Props:
 * - clients: Array of client objects to display
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Client, SortConfig } from '../../types';
import { EmptyState } from '../UI';

interface ClientTableProps {
  clients: Client[];
  isLoading?: boolean;
}

const ClientTable: React.FC<ClientTableProps> = ({ clients, isLoading = false }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig<Client>>({
    field: 'totalRevenue',
    direction: 'desc'
  });

  const handleSort = (field: keyof Client) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedClients = [...clients].sort((a, b) => {
    const aValue = a[sortConfig.field];
    const bValue = b[sortConfig.field];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const SortIcon: React.FC<{ field: keyof Client }> = ({ field }) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-2xl border border-sage-200 overflow-hidden shadow-sm">
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-sage-200 bg-gradient-soft">
        <h3 className="text-lg sm:text-xl font-bold text-sage-900">Client Profitability</h3>
        <p className="text-sm text-sage-600 mt-1">Revenue, fees, and net profit by client</p>
      </div>
      
      {clients.length === 0 && !isLoading && (
        <div className="p-6">
          <EmptyState
            title="No clients found"
            description="You don't have any clients yet. Connect your Stripe account or add clients manually to see profitability data."
            icon={Users}
            variant="subtle"
            className="mx-auto"
          />
        </div>
      )}
      
      {clients.length > 0 && (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
      </div>
      
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-sage-50">
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider cursor-pointer hover:bg-sage-100 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center space-x-1">
                  <span>Client</span>
                  <SortIcon field="name" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider cursor-pointer hover:bg-sage-100 transition-colors"
                onClick={() => handleSort('totalRevenue')}
              >
                <div className="flex items-center space-x-1">
                  <span>Revenue</span>
                  <SortIcon field="totalRevenue" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider cursor-pointer hover:bg-sage-100 transition-colors"
                onClick={() => handleSort('stripeFees')}
              >
                <div className="flex items-center space-x-1">
                  <span>Stripe Fees</span>
                  <SortIcon field="stripeFees" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider cursor-pointer hover:bg-sage-100 transition-colors"
                onClick={() => handleSort('netProfit')}
              >
                <div className="flex items-center space-x-1">
                  <span>Net Profit</span>
                  <SortIcon field="netProfit" />
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider cursor-pointer hover:bg-sage-100 transition-colors"
                onClick={() => handleSort('transactionCount')}
              >
                <div className="flex items-center space-x-1">
                  <span>Transactions</span>
                  <SortIcon field="transactionCount" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-sage-700 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-sage-200">
            {sortedClients.map((client) => (
              <tr key={client.id} className="hover:bg-sage-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-sm">
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                    client.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-sage-100 text-sage-800'
                  }`}>
                    {client.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="divide-y divide-sage-200">
          {sortedClients.map((client) => (
            <div key={client.id} className="p-4 sm:p-6 hover:bg-sage-50 transition-colors">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-sm">
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
        </>
      )}
    </div>
  );
};

export default ClientTable;
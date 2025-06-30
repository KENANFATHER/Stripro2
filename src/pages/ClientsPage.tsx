/**
 * Clients Page Component
 * 
 * This page displays a comprehensive list of all clients with advanced
 * filtering, sorting, and search capabilities. It provides detailed
 * profitability metrics for each client.
 * 
 * Features:
 * - Client search and filtering
 * - Sortable columns for all metrics
 * - Status filtering (active/inactive)
 * - Export functionality
 * - Responsive grid and list views
 * 
 * Usage:
 * - Rendered when user navigates to clients route
 * - Provides detailed client management interface
 * - Links to individual client detail pages
 * 
 * Data Sources:
 * - Client list from clientService
 * - Real-time profitability calculations
 * - Transaction summaries per client
 */

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Plus, Users, AlertOctagon } from 'lucide-react';
import { Client } from '../types';
import { clientService } from '../services';
import { useApi, useDebounce } from '../hooks';
import { EmptyState, LoadingState, ErrorState } from '../components/UI';
import { ErrorBoundary } from '../components';

const ClientsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortField, setSortField] = useState<keyof Client>('totalRevenue');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { 
    data: clients, 
    loading, 
    error, 
    execute: fetchClients 
  } = useApi<Client[]>();

  // Fetch clients when filters change
  useEffect(() => {
    const filters = {
      search: debouncedSearchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sortBy: sortField,
      sortOrder: sortDirection
    };

    fetchClients(() => clientService.getClients(filters));
  }, [debouncedSearchTerm, statusFilter, sortField, sortDirection, fetchClients]);

  const handleSort = (field: keyof Client) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportData = () => {
    // TODO: Implement actual export functionality
    alert('Export functionality would download client data as CSV/Excel file');
  };

  const handleViewClient = (clientId: string) => {
    // TODO: Navigate to client detail page
    console.log('View client:', clientId);
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Clients</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-2">
              Detailed view of all your clients and their profitability
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportData}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {clientsLoading && (
        <LoadingState 
          message="Loading clients..." 
          size="large" 
          className="py-12"
        />
      )}

      {/* Error State */}
      {clientsError && (
        <ErrorState
          title="Error loading clients"
          message={clientsError}
          onRetry={() => fetchClients(() => clientService.getClients(filters))}
          className="mb-6"
        />
      )}

      {/* Clients Grid with Error Boundary */}
      <ErrorBoundary
        fallback={
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <AlertOctagon className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="text-lg font-medium text-red-800">Component Error</h3>
                <p className="text-red-700">There was an error rendering the clients grid. Please try refreshing the page.</p>
              </div>
            </div>
          </div>
        }
      >
        {clients && clients.length > 0 && !clientsLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-700">
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.email}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  client.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {client.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(client.totalRevenue)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stripe Fees</span>
                  <span className="font-medium text-red-600">
                    -{formatCurrency(client.stripeFees)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Net Profit</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(client.netProfit)}
                  </span>
                </div>
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {client.transactionCount} transactions
                    </span>
                    <span className="text-gray-600">
                      Last: {formatDate(client.lastTransaction)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => handleViewClient(client.id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
        )}
      </ErrorBoundary>

      {/* Empty State */}
      {clients && clients.length === 0 && !clientsLoading && !clientsError && (
        <EmptyState
          title="No clients found"
          description={searchTerm || statusFilter !== 'all' ? 
            "Try adjusting your search terms or filters to find what you're looking for." : 
            "You don't have any clients yet. Add your first client to get started."}
          icon={searchTerm || statusFilter !== 'all' ? Search : Users}
          action={searchTerm || statusFilter !== 'all' ? undefined : {
            label: "Add First Client",
            onClick: () => console.log("Add client clicked")
          }}
          size="large"
          className="py-12 mx-auto"
        />
      )}
    </div>
  );
};

export default ClientsPage;
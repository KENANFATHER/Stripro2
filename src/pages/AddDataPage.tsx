/**
 * Add Data Page Component
 * 
 * This page provides a form interface for manually adding client
 * transaction data when Stripe integration is not available or
 * for historical data entry.
 * 
 * Features:
 * - Transaction form with validation
 * - Real-time fee calculations
 * - Client selection and creation
 * - Bulk data import capabilities
 * - Success/error feedback
 * 
 * Usage:
 * - Rendered when user navigates to add-data route
 * - Allows manual transaction entry
 * - Calculates Stripe fees automatically
 * 
 * Data Sources:
 * - Client list for selection
 * - Transaction creation via API
 * - Fee calculation utilities
 */

import React, { useState, useEffect } from 'react';
import { Plus, Save, X, Calculator, Upload, FileText } from 'lucide-react';
import { useNotification } from '../contexts/NotificationContext';
import { EmptyState, ErrorState } from '../components/UI';

interface FormData {
  clientName: string;
  clientEmail: string;
  amount: string;
  description: string;
  date: string;
}

const AddDataPage: React.FC = () => {
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientEmail: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, return empty array
        setTransactions([]);
      } catch (err) {
        setError('Failed to load transaction history');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTransactions();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success notification
      showNotification(
        'success',
        'Demo Transaction Added',
        `Successfully added demo transaction for ${formData.clientName}`
      );
      
      // Reset form
      setFormData({
        clientName: '',
        clientEmail: '',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });

    } catch (error) {
      showNotification(
        'error',
        'Error Adding Transaction',
        error instanceof Error ? error.message : 'Failed to add transaction. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setFormData({
      clientName: '',
      clientEmail: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  // Calculate Stripe fees (2.9% + $0.30)
  const calculateStripeFee = (amount: number) => {
    return (amount * 0.029 + 0.30).toFixed(2);
  };

  const calculateNetAmount = (amount: number) => {
    const fee = parseFloat(calculateStripeFee(amount));
    return (amount - fee).toFixed(2);
  };

  const amount = parseFloat(formData.amount) || 0;

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Transaction Data</h1>
        <p className="text-gray-600 mt-2">
          Manually add client transactions and revenue data
        </p>
      </div>

      <div className="max-w-2xl">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Name */}
            <div>
              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter client name"
              />
            </div>

            {/* Client Email */}
            <div>
              <label htmlFor="clientEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Client Email *
              </label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="client@example.com"
              />
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Transaction Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Date *
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
              placeholder="Optional description of the transaction"
            />
          </div>

          {/* Fee Calculation Display */}
          {amount > 0 && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Calculator className="w-4 h-4 text-gray-600" />
                <h4 className="text-sm font-medium text-gray-700">Fee Calculation</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Amount:</span>
                  <span className="font-medium">${amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stripe Fee (2.9% + $0.30):</span>
                  <span className="text-red-600">-${calculateStripeFee(amount)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-medium text-gray-900">Net Amount:</span>
                  <span className="font-medium text-green-600">${calculateNetAmount(amount)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="mt-6 flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Add Transaction</span>
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={clearForm}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </form>

        {/* Bulk Import Section */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
          
          {error && (
            <ErrorState
              message={error}
              onRetry={() => {
                setIsLoading(true);
                setError(null);
                // Simulate API call
                setTimeout(() => {
                  setTransactions([]);
                  setIsLoading(false);
                }, 1000);
              }}
              className="mb-6"
            />
          )}
          
          {!isLoading && !error && transactions.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <EmptyState
                title="No transaction history"
                description="You haven't added any transactions yet. Use the form above to add your first transaction."
                icon={FileText}
                variant="subtle"
                className="mx-auto"
              />
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-4">Bulk Import</h4>
                <p className="text-gray-600 mb-4">
                  Import multiple transactions from a CSV file. Download our template to get started.
                </p>
                <div className="flex space-x-3">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <FileText className="w-4 h-4" />
                    <span>Download Template</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Upload CSV</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDataPage;
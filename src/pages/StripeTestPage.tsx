/**
 * Stripe Test Page
 * 
 * This page provides a comprehensive testing interface for Stripe integration.
 * It includes tools for testing the connection flow, webhooks, and Edge Functions.
 * 
 * IMPORTANT: This page should only be accessible in development environments
 * and should be excluded from production builds.
 */

import React, { useState } from 'react';
import { Bug, CreditCard, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import StripeTestPanel from '../components/Testing/StripeTestPanel';
import { stripeService } from '../services/stripe';
import { useNotification } from '../contexts/NotificationContext';

const StripeTestPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  const handleConnectStripe = async () => {
    try {
      // Implementation removed for production
      showNotification(
        'warning',
        'Test Mode Disabled',
        'Stripe test functionality has been disabled in production.'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect Stripe';
      showNotification(
        'error',
        'Connection Failed',
        errorMessage
      );
    }
  };

  const handleTestApiKey = async () => {
    setIsLoading(true);
    try {
      // Implementation removed for production
      showNotification(
        'warning',
        'Test Mode Disabled',
        'Stripe test functionality has been disabled in production.'
      );
    } catch (error) {
      showNotification(
        'error',
        'Test Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2">
          <Bug className="w-6 h-6 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">Stripe Integration Testing</h1>
        </div>
        <div className="flex items-center mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
          <p className="text-yellow-800">
            This page is for development and testing purposes only. It should not be accessible in production.
          </p>
        </div>
      </div>

      {/* Test Environment Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Test Environment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Stripe Configuration</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium">
                  {process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Supabase URL:</span>
                <span className="font-medium font-mono text-xs">
                  {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stripe Mode:</span>
                <span className="font-medium">
                  {stripeService.getConfigInfo().keyType === 'test' ? 'Test Mode' : 'Live Mode'}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <button
                onClick={handleTestApiKey}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                <span>Test API Key</span>
              </button>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Connect Flow Testing</h3>
            <p className="text-sm text-gray-600 mb-4">
              Test the Stripe Connect OAuth flow by connecting a test account.
            </p>
            
            <button
              onClick={handleConnectStripe}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>Connect Test Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results</h2>
          
          {testResults.apiKeyTest && (
            <div className={`p-4 rounded-lg ${
              testResults.apiKeyTest.valid 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {testResults.apiKeyTest.valid ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  testResults.apiKeyTest.valid ? 'text-green-800' : 'text-red-800'
                }`}>
                  API Key Test: {testResults.apiKeyTest.valid ? 'Valid' : 'Invalid'}
                </span>
              </div>
              
              {!testResults.apiKeyTest.valid && testResults.apiKeyTest.error && (
                <div className="mt-2 ml-7 text-sm text-red-700">
                  Error: {testResults.apiKeyTest.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stripe Test Panel */}
      <StripeTestPanel isVisible={true} />
      
      {/* Test Card Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Test Cards</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Card Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry / CVC / ZIP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Visa (Success)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  4242 4242 4242 4242
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Any future date / Any 3 digits / Any 5 digits
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Successful payment
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Visa (Decline)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  4000 0000 0000 0002
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Any future date / Any 3 digits / Any 5 digits
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Generic decline
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Visa (3D Secure)
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                  4000 0000 0000 3220
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Any future date / Any 3 digits / Any 5 digits
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  3D Secure authentication
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StripeTestPage;
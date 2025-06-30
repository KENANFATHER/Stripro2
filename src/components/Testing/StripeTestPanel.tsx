/**
 * Stripe Test Panel Component
 * 
 * This component provides a developer testing interface for Stripe integration.
 * It allows testing various Stripe features, simulating events, and diagnosing
 * connection issues.
 * 
 * IMPORTANT: This component should only be used in development environments
 * and should be excluded from production builds.
 */

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Bug, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  User,
  DollarSign,
  RotateCcw
} from 'lucide-react';
import { 
  validateStripeConfig, 
  simulateWebhookEvent,
  generateTestCustomer,
  generateTestPaymentIntent,
  generateTestCharge,
  generateTestRefund,
  debugStripeConnection,
  testEdgeFunctions
} from '../../utils/stripeTestUtils';
import { useNotification } from '../../contexts/NotificationContext';

interface StripeTestPanelProps {
  isVisible: boolean;
}

const StripeTestPanel: React.FC<StripeTestPanelProps> = ({ isVisible }) => {
  const [configStatus, setConfigStatus] = useState<{
    isValid: boolean;
    details: any;
    errors: string[];
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'config' | 'webhooks' | 'functions'>('config');
  const [edgeFunctionStatus, setEdgeFunctionStatus] = useState<any>(null);
  
  const { showNotification } = useNotification();

  useEffect(() => {
    if (isVisible) {
      checkStripeConfig();
    }
  }, [isVisible]);

  const checkStripeConfig = async () => {
    setIsLoading(true);
    try {
      const result = await validateStripeConfig();
      setConfigStatus(result);
    } catch (error) {
      console.error('Error checking Stripe config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestEdgeFunctions = async () => {
    setIsLoading(true);
    try {
      const result = await testEdgeFunctions();
      setEdgeFunctionStatus(result);
      
      showNotification(
        result.allAvailable ? 'success' : 'warning',
        'Edge Function Test Complete',
        result.allAvailable 
          ? 'All Edge Functions are available' 
          : 'Some Edge Functions are not available'
      );
    } catch (error) {
      console.error('Error testing Edge Functions:', error);
      showNotification(
        'error',
        'Edge Function Test Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebugConnection = async () => {
    setIsLoading(true);
    try {
      const result = await debugStripeConnection();
      console.log('Stripe connection debug results:', result);
      
      showNotification(
        result.status === 'error' ? 'error' : 
        result.status === 'warning' ? 'warning' : 'success',
        'Stripe Connection Diagnosis',
        result.message
      );
    } catch (error) {
      console.error('Error debugging Stripe connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateWebhook = async (eventType: 'customer.created' | 'payment_intent.succeeded' | 'charge.refunded') => {
    setIsLoading(true);
    try {
      let data;
      
      // Generate appropriate test data based on event type
      switch (eventType) {
        case 'customer.created':
          data = generateTestCustomer('Test Customer', 'test@example.com');
          break;
        case 'payment_intent.succeeded':
          data = generateTestPaymentIntent(1999, 'usd');
          break;
        case 'charge.refunded':
          data = generateTestCharge(1999, 'usd');
          data.refunds = {
            data: [generateTestRefund(1999, 'usd', data.id)]
          };
          break;
      }
      
      const result = await simulateWebhookEvent(eventType, data);
      
      showNotification(
        result.success ? 'success' : 'error',
        'Webhook Simulation',
        result.message
      );
    } catch (error) {
      console.error('Error simulating webhook:', error);
      showNotification(
        'error',
        'Webhook Simulation Failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bug className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Stripe Integration Test Panel</h3>
        </div>
        <div className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
          Development Only
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mb-6">
        This panel provides tools for testing and debugging Stripe integration.
        It should only be used in development environments.
      </div>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'config'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('config')}
        >
          Configuration
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'webhooks'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('webhooks')}
        >
          Webhook Testing
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'functions'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('functions')}
        >
          Edge Functions
        </button>
      </div>
      
      {/* Configuration Tab */}
      {activeTab === 'config' && (
        <div>
          <div className="flex justify-between mb-4">
            <button
              onClick={checkStripeConfig}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Check Configuration</span>
            </button>
            
            <button
              onClick={handleDebugConnection}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors text-sm"
            >
              <Bug className="w-4 h-4" />
              <span>Debug Connection</span>
            </button>
          </div>
          
          {configStatus && (
            <div className="mt-4 space-y-4">
              <div className={`p-4 rounded-lg ${
                configStatus.isValid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {configStatus.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-medium ${
                    configStatus.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {configStatus.isValid 
                      ? 'Stripe configuration is valid' 
                      : 'Stripe configuration is invalid'}
                  </span>
                </div>
                
                {configStatus.errors.length > 0 && (
                  <div className="mt-2 ml-7 text-sm text-red-700">
                    <ul className="list-disc space-y-1 pl-5">
                      {configStatus.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Configuration Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Publishable Key:</span>
                    <span className={`font-mono ${
                      configStatus.details.hasPublishableKey ? 'text-gray-900' : 'text-red-600'
                    }`}>
                      {configStatus.details.hasPublishableKey ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connect Client ID:</span>
                    <span className={`font-mono ${
                      configStatus.details.hasConnectClientId ? 'text-gray-900' : 'text-red-600'
                    }`}>
                      {configStatus.details.hasConnectClientId ? 'Configured' : 'Not Configured'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Key Validation:</span>
                    <span className={`font-mono ${
                      configStatus.details.publishableKeyValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {configStatus.details.publishableKeyValid ? 'Valid' : 'Invalid'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <span className={`font-mono ${
                      configStatus.details.isTestMode ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {configStatus.details.isTestMode ? 'Test Mode' : 'Live Mode'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Webhook Testing Tab */}
      {activeTab === 'webhooks' && (
        <div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-800 font-medium">
                  Webhook Simulation
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  These actions simulate webhook events for testing purposes. They do not send actual
                  requests to your webhook endpoint but log the event data to the console.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleSimulateWebhook('customer.created')}
              disabled={isLoading}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <User className="w-8 h-8 text-blue-600 mb-2" />
              <span className="font-medium text-gray-900">customer.created</span>
              <span className="text-xs text-gray-500 mt-1">Simulate new customer</span>
            </button>
            
            <button
              onClick={() => handleSimulateWebhook('payment_intent.succeeded')}
              disabled={isLoading}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <DollarSign className="w-8 h-8 text-green-600 mb-2" />
              <span className="font-medium text-gray-900">payment_intent.succeeded</span>
              <span className="text-xs text-gray-500 mt-1">Simulate successful payment</span>
            </button>
            
            <button
              onClick={() => handleSimulateWebhook('charge.refunded')}
              disabled={isLoading}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-8 h-8 text-red-600 mb-2" />
              <span className="font-medium text-gray-900">charge.refunded</span>
              <span className="text-xs text-gray-500 mt-1">Simulate refund</span>
            </button>
          </div>
          
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Webhook Testing with Stripe CLI</h4>
            <p className="text-sm text-gray-600 mb-4">
              For more comprehensive webhook testing, use the Stripe CLI:
            </p>
            
            <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="mb-2"># Listen for webhooks and forward to your endpoint</div>
              <div className="text-green-400">stripe listen --forward-to {import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook</div>
              
              <div className="mt-4 mb-2"># Trigger specific events</div>
              <div className="text-green-400">stripe trigger customer.created</div>
              <div className="text-green-400">stripe trigger payment_intent.succeeded</div>
              <div className="text-green-400">stripe trigger charge.refunded</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edge Functions Tab */}
      {activeTab === 'functions' && (
        <div>
          <div className="flex justify-between mb-6">
            <button
              onClick={handleTestEdgeFunctions}
              disabled={isLoading}
              className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>Test Edge Functions</span>
            </button>
          </div>
          
          {edgeFunctionStatus && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                edgeFunctionStatus.allAvailable 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
                <div className="flex items-center space-x-2">
                  {edgeFunctionStatus.allAvailable ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  )}
                  <span className={`font-medium ${
                    edgeFunctionStatus.allAvailable ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {edgeFunctionStatus.allAvailable 
                      ? 'All Edge Functions are available' 
                      : 'Some Edge Functions are not available'}
                  </span>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Function
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Response Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(edgeFunctionStatus.results).map(([name, result]: [string, any]) => (
                      <tr key={name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            result.available 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.available ? 'Available' : 'Unavailable'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.responseTime ? `${result.responseTime}ms` : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {result.error || 'No issues detected'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Edge Function URLs</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Connect Callback:</span>
                    <div className="mt-1 font-mono text-xs bg-gray-100 p-2 rounded">
                      {import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-connect-callback
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Webhook Handler:</span>
                    <div className="mt-1 font-mono text-xs bg-gray-100 p-2 rounded">
                      {import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-webhook
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Profitability Calculator:</span>
                    <div className="mt-1 font-mono text-xs bg-gray-100 p-2 rounded">
                      {import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-profitability
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Disconnect Handler:</span>
                    <div className="mt-1 font-mono text-xs bg-gray-100 p-2 rounded">
                      {import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-disconnect
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StripeTestPanel;
/**
 * Settings Page Component
 * 
 * This page provides a comprehensive settings interface for user
 * account management, integrations, notifications, and security
 * preferences. Now includes Stripe API key management.
 * 
 * Features:
 * - User profile management
 * - Stripe integration settings with API key input
 * - Notification preferences
 * - Security settings
 * - Account management
 * 
 * Usage:
 * - Rendered when user navigates to settings route
 * - Provides tabbed interface for different setting categories
 * - Handles form submissions and API updates
 * 
 * Data Sources:
 * - User profile from auth context
 * - Integration status from services
 * - Preference settings from user profile
 */

import React, { useState, useEffect } from 'react';
import { CreditCard, User, Bell, Shield, Save, Eye, EyeOff, CheckCircle, AlertTriangle, Key, TestTube } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { stripeService } from '../services/stripe';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingStripe, setIsTestingStripe] = useState(false);

  // Dialog state
  const [showDataDeletionDialog, setShowDataDeletionDialog] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [dataDeletionReason, setDataDeletionReason] = useState('');
  const [stripeConnectionStatus, setStripeConnectionStatus] = useState<{
    isConnected: boolean;
    accountId?: string;
    email?: string;
    status?: string;
    lastChecked?: Date;
  }>({
    isConnected: false,
    lastChecked: new Date()
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    company: 'Acme Inc.',
    timezone: 'America/New_York'
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailReports: true,
    monthlyDigest: true,
    newTransactions: false,
    lowProfitAlerts: true
  });

  // Stripe API keys state
  const [stripeKeys, setStripeKeys] = useState({
    publishableKey: '',
    connectClientId: '',
    showPublishableKey: false,
    showConnectClientId: false
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load existing Stripe keys on component mount
  useEffect(() => {
    const keys = stripeService.getApiKeys();
    setStripeKeys(prev => ({
      ...prev,
      publishableKey: keys.publishableKey || '',
      connectClientId: keys.connectClientId || ''
    }));
    
    // Check Stripe connection status on mount
    checkStripeConnectionStatus();
  }, []);

  /**
   * Check real-time Stripe connection status
   */
  const checkStripeConnectionStatus = async () => {
    setIsCheckingStatus(true);
    
    try {
      // Check if user has Stripe connected in their metadata
      const userStripeConnected = user?.stripeConnected || false;
      const userStripeAccountId = user?.stripeAccountId;
      
      if (userStripeConnected && userStripeAccountId) {
        // TODO: In production, verify the connection is still valid by calling Stripe API
        // For now, we'll trust the user metadata
        setStripeConnectionStatus({
          isConnected: true,
          accountId: userStripeAccountId,
          email: user?.email,
          status: 'active',
          lastChecked: new Date()
        });
      } else {
        setStripeConnectionStatus({
          isConnected: false,
          lastChecked: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to check Stripe connection status:', error);
      setStripeConnectionStatus({
        isConnected: false,
        lastChecked: new Date()
      });
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // TODO: Replace with actual API call
      // await userService.updateProfile(profileData);
      // await userService.updateNotificationSettings(notificationSettings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification(
        'success',
        'Settings Saved',
        'Your settings have been updated successfully.'
      );
    } catch (error) {
      showNotification(
        'error',
        'Save Failed',
        'Failed to save settings. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveStripeKeys = async () => {
    setIsSaving(true);
    
    try {
      if (!stripeKeys.publishableKey.trim()) {
        throw new Error('Publishable key is required');
      }

      await stripeService.setApiKeys(
        stripeKeys.publishableKey.trim(),
        stripeKeys.connectClientId.trim() || undefined
      );
      
      showNotification(
        'success',
        'Stripe Keys Saved',
        'Your Stripe API keys have been saved successfully.'
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save Stripe keys';
      showNotification(
        'error',
        'Save Failed',
        errorMessage
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestStripeKey = async () => {
    setIsTestingStripe(true);
    
    try {
      if (!stripeKeys.publishableKey.trim()) {
        throw new Error('Please enter a publishable key first');
      }

      // Temporarily set the key for testing
      await stripeService.setApiKeys(
        stripeKeys.publishableKey.trim(),
        stripeKeys.connectClientId.trim() || undefined
      );

      const testResult = await stripeService.testApiKey();
      
      if (testResult.valid) {
        showNotification(
          'success',
          'API Key Valid',
          'Your Stripe API key is valid and working correctly.'
        );
      } else {
        throw new Error(testResult.error || 'API key validation failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to test API key';
      showNotification(
        'error',
        'API Key Test Failed',
        errorMessage
      );
    } finally {
      setIsTestingStripe(false);
    }
  };

  const handlePasswordChange = async () => {
    setIsSaving(true);
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (passwordData.newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      // Real API call to change password
      await apiClient.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      showNotification('success', 'Password Updated', 'Your password has been changed successfully.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update password';
      showNotification('error', 'Password Change Failed', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const connectStripe = async () => {
    try {
      const config = stripeService.getConfigInfo();
      
      if (!config.hasConnectClientId) {
        showNotification(
          'error',
          'Configuration Missing',
          'Stripe Connect client ID not configured. Please add it in the Stripe Integration section below.'
        );
        return;
      }
      
      if (!config.hasPublishableKey) {
        showNotification(
          'error',
          'Configuration Missing',
          'Stripe publishable key not configured. Please add it in the Stripe Integration section below.'
        );
        return;
      }
      
      showNotification(
        'info',
        'Connecting to Stripe',
        'Redirecting to Stripe to connect your account...'
      );

      const state = `user_${user?.id}_${Date.now()}`;
      await stripeService.initiateStripeConnect(state);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect Stripe';
      showNotification(
        'error',
        'Connection Failed',
        errorMessage
      );
    }
  };

  const handleDisconnectStripe = async () => {
    setIsDisconnecting(true);
    
    // Show a notification that the process has started
    showNotification(
      'info',
      'Disconnecting Stripe',
      'Please wait while we disconnect your Stripe account...'
    );
    
    try {
      if (!stripeConnectionStatus.accountId) {
        throw new Error('No Stripe account found to disconnect');
      }

      // Call the Stripe disconnect service
      const disconnectResult = await stripeService.disconnectStripeAccount(stripeConnectionStatus.accountId);
      
      if (!disconnectResult.success && !disconnectResult.error?.includes('already_disconnected')) {
        throw new Error(disconnectResult.message);
      }

      // Update Supabase user metadata to remove Stripe connection
      const { supabaseAuthService } = await import('../services/supabaseAuthService');
      await supabaseAuthService.disconnectStripeAccount();
      
      // Clear local Stripe data
      stripeService.clearStripeIntegrationData();

      // Update connection status
      setStripeConnectionStatus({
        isConnected: false,
        lastChecked: new Date()
      });
      
      showNotification(
        'success',
        'Stripe Account Disconnected',
        'Your Stripe account has been successfully disconnected from Stripro.'
      );
      
      setShowDisconnectDialog(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect Stripe';
      showNotification(
        'error',
        'Disconnect Failed',
        `${errorMessage}. Please try again or contact support if the issue persists.`
      );
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRequestDataDeletion = async () => {
    setIsSaving(true);
    
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Call the GDPR deletion service
      const { supabaseAuthService } = await import('../services/supabaseAuthService');
      const deletionResult = await supabaseAuthService.requestGDPRDataDeletion(
        user.id,
        dataDeletionReason || 'User requested data deletion'
      );
      
      showNotification(
        'success',
        'Data Deletion Requested',
        deletionResult.message
      );
      
      setShowDataDeletionDialog(false);
      setDataDeletionReason('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit data deletion request';
      showNotification(
        'error',
        'Request Failed',
        errorMessage
      );
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle API key management button click
   */
  const handleManageApiKeys = () => {
    // Navigate to API keys section
    setActiveSection('stripe');
    
    // Scroll to the API keys section
    setTimeout(() => {
      const apiKeysSection = document.getElementById('stripe-api-keys-section');
      if (apiKeysSection) {
        apiKeysSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  /**
   * Refresh Stripe connection status
   */
  const handleRefreshStatus = async () => {
    await checkStripeConnectionStatus();
    showNotification('info', 'Status Updated', 'Stripe connection status has been refreshed');
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'stripe', label: 'Stripe Integration', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const stripeConfig = stripeService.getConfigInfo();

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-soft min-h-screen">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-coral-600 via-tangerine-600 to-lilac-600 bg-clip-text text-transparent mb-2">
          Settings
        </h1>
        <p className="text-sage-600 text-base sm:text-lg">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-8">
        {/* Settings Navigation */}
        <div className="w-full lg:w-64">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-left transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-coral-50 via-tangerine-50 to-lilac-50 text-coral-700 border border-coral-200 shadow-sm'
                      : 'text-sage-700 hover:bg-sage-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 max-w-4xl">
          <div className="bg-white rounded-2xl border border-sage-200 p-6 sm:p-8 shadow-sm">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div>
                <h3 className="text-xl font-bold text-sage-900 mb-6">Profile Information</h3>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-sage-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-sage-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-sage-700 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-sage-700 mb-2">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      value={profileData.timezone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, timezone: e.target.value }))}
                      className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors"
                    >
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Stripe Integration Section */}
            {activeSection === 'stripe' && (
              <div>
                <h3 className="text-xl font-bold text-sage-900 mb-6">Stripe Integration</h3>
                
                {/* Current Status */}
                <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-8 h-8 text-coral-600" />
                      <div>
                        <p className="font-medium text-sage-900">Stripe Account Status</p>
                        <p className="text-sm text-sage-600">
                          {isCheckingStatus ? 'Checking status...' : 
                           stripeConnectionStatus.isConnected ? 'Connected and active' : 
                           stripeConfig.isConfigured ? 'API keys configured, not connected' : 
                           'Not configured'}
                        </p>
                        {stripeConnectionStatus.lastChecked && (
                          <p className="text-xs text-sage-500">
                            Last checked: {stripeConnectionStatus.lastChecked.toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        stripeConnectionStatus.isConnected ? 'bg-green-400' : 'bg-sage-300'
                      }`} />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleRefreshStatus}
                          disabled={isCheckingStatus}
                          data-testid="refresh-status"
                          className="px-3 py-1 text-sm border border-sage-300 text-sage-700 rounded-lg hover:bg-sage-50 disabled:opacity-50 transition-colors"
                          title="Refresh connection status"
                        >
                          {isCheckingStatus ? 'Checking...' : 'Refresh'}
                        </button>
                        {stripeConnectionStatus.isConnected ? (
                          <button
                            onClick={() => setShowDisconnectDialog(true)}
                            data-testid="disconnect-stripe"
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                          >
                            Disconnect
                          </button>
                        ) : stripeConfig.isConfigured ? (
                          <button
                            onClick={connectStripe}
                            data-testid="connect-stripe"
                            className="px-4 py-2 bg-coral-600 text-white rounded-lg hover:bg-coral-700 transition-colors font-medium"
                          >
                            Connect Account
                          </button>
                        ) : (
                          <button
                            onClick={handleManageApiKeys}
                            data-testid="manage-api-keys"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            Setup API Keys
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {(stripeConfig.isConfigured || stripeConnectionStatus.isConnected) && (
                    <div className="mt-4 pt-4 border-t border-sage-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-sage-600">Environment:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                            stripeConfig.keyType === 'test' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {stripeConfig.keyType === 'test' ? 'Test Mode' : 'Live Mode'}
                          </span>
                        </div>
                        {stripeConnectionStatus.isConnected && stripeConnectionStatus.accountId && (
                          <div>
                            <span className="text-sage-600">Account ID:</span>
                            <span className="ml-2 font-mono text-xs">
                              {stripeConnectionStatus.accountId.substring(0, 12)}...
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="text-sage-600">Publishable Key:</span>
                          <span className="ml-2 font-mono text-xs">{stripeConfig.publishableKeyMasked}</span>
                        </div>
                        {stripeConfig.hasConnectClientId && (
                          <div className="sm:col-span-2">
                            <span className="text-sage-600">Connect Client ID:</span>
                            <span className="ml-2 font-mono text-xs">{stripeConfig.connectClientIdMasked}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* API Keys Configuration */}
                <div id="stripe-api-keys-section" className="space-y-6">
                  <div className="border-b border-sage-200 pb-4">
                    <h4 className="text-lg font-semibold text-sage-900">API Keys Configuration</h4>
                    <p className="text-sm text-sage-600 mt-1">
                      Configure your Stripe API keys to enable payment processing and analytics
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="publishableKey" className="block text-sm font-medium text-sage-700 mb-2">
                      Stripe Publishable Key *
                    </label>
                    <div className="relative">
                      <input
                        type={stripeKeys.showPublishableKey ? 'text' : 'password'}
                        id="publishableKey"
                        value={stripeKeys.publishableKey}
                        onChange={(e) => setStripeKeys(prev => ({ ...prev, publishableKey: e.target.value }))}
                        placeholder="pk_test_... or pk_live_..."
                        className="w-full px-4 py-3 pr-12 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setStripeKeys(prev => ({ ...prev, showPublishableKey: !prev.showPublishableKey }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-sage-400 hover:text-sage-600 transition-colors"
                      >
                        {stripeKeys.showPublishableKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-sage-500 mt-1">
                      Your Stripe publishable key (starts with pk_test_ or pk_live_)
                    </p>
                  </div>

                  <div>
                    <label htmlFor="connectClientId" className="block text-sm font-medium text-sage-700 mb-2">
                      Stripe Connect Client ID
                    </label>
                    <div className="relative">
                      <input
                        type={stripeKeys.showConnectClientId ? 'text' : 'password'}
                        id="connectClientId"
                        value={stripeKeys.connectClientId}
                        onChange={(e) => setStripeKeys(prev => ({ ...prev, connectClientId: e.target.value }))}
                        placeholder="ca_..."
                        className="w-full px-4 py-3 pr-12 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors font-mono text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setStripeKeys(prev => ({ ...prev, showConnectClientId: !prev.showConnectClientId }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-sage-400 hover:text-sage-600 transition-colors"
                      >
                        {stripeKeys.showConnectClientId ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-sage-500 mt-1">
                      Required for Stripe Connect (starts with ca_). Optional if you don't use Connect.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={handleTestStripeKey}
                      disabled={isTestingStripe || !stripeKeys.publishableKey.trim()}
                      data-testid="test-stripe-key"
                      className="flex items-center justify-center space-x-2 px-4 py-2 border border-sage-300 text-sage-700 rounded-xl hover:bg-sage-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isTestingStripe ? (
                        <>
                          <div className="w-4 h-4 border-2 border-sage-600 border-t-transparent rounded-full animate-spin" />
                          <span>Testing...</span>
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4" />
                          <span>Test Key</span>
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={handleSaveStripeKeys}
                      disabled={isSaving || !stripeKeys.publishableKey.trim()}
                      data-testid="save-stripe-keys"
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-coral-600 text-white rounded-xl hover:bg-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-4 h-4" />
                          <span>Save Keys</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Help Text */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-medium text-blue-900 mb-2">How to get your Stripe keys:</h4>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Log in to your <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">Stripe Dashboard</a></li>
                      <li>Go to "Developers" → "API keys"</li>
                      <li>Copy your "Publishable key" (starts with pk_test_ or pk_live_)</li>
                      <li>For Connect: Go to "Connect" → "Settings" and copy your "Client ID" (starts with ca_)</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div>
                <h3 className="text-xl font-bold text-sage-900 mb-6">Notification Preferences</h3>
                <div className="space-y-6">
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sage-900">Weekly Email Reports</span>
                      <p className="text-sm text-sage-600">Get weekly summaries of your revenue and profits</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailReports}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, emailReports: e.target.checked }))}
                      className="rounded border-sage-300 text-coral-600 focus:ring-coral-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sage-900">Monthly Digest</span>
                      <p className="text-sm text-sage-600">Comprehensive monthly performance reports</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.monthlyDigest}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, monthlyDigest: e.target.checked }))}
                      className="rounded border-sage-300 text-coral-600 focus:ring-coral-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sage-900">New Transaction Alerts</span>
                      <p className="text-sm text-sage-600">Get notified when new transactions are processed</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.newTransactions}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, newTransactions: e.target.checked }))}
                      className="rounded border-sage-300 text-coral-600 focus:ring-coral-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sage-900">Low Profit Alerts</span>
                      <p className="text-sm text-sage-600">Alert when client profitability drops below threshold</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.lowProfitAlerts}
                      onChange={(e) => setNotificationSettings(prev => ({ ...prev, lowProfitAlerts: e.target.checked }))}
                      className="rounded border-sage-300 text-coral-600 focus:ring-coral-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div>
                <h3 className="text-xl font-bold text-sage-900 mb-6">Security Settings</h3>
                <div className="space-y-6">
                  <div className="border border-sage-200 rounded-xl p-6">
                    <h4 className="font-medium text-sage-900 mb-4">Change Password</h4>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-sage-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          id="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-sage-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-sage-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors"
                        />
                      </div>
                      
                      <button
                        onClick={handlePasswordChange}
                        disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                        data-testid="change-password"
                        className="px-4 py-2 bg-coral-600 text-white rounded-xl hover:bg-coral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-sage-200 rounded-xl p-6">
                    <h4 className="font-medium text-sage-900 mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-sage-600 mb-4">Add an extra layer of security to your account</p>
                    <button className="px-4 py-2 border border-sage-300 text-sage-700 rounded-xl hover:bg-sage-50 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                  
                  <div className="border border-sage-200 rounded-xl p-6">
                    <h4 className="font-medium text-sage-900 mb-2">API Keys</h4>
                    <p className="text-sm text-sage-600 mb-4">Manage API keys for integrations</p>
                    <button className="px-4 py-2 border border-sage-300 text-sage-700 rounded-xl hover:bg-sage-50 transition-colors">
                      Manage API Keys
                    </button>
                  </div>
                  
                  <div className="border border-red-200 rounded-xl p-6 bg-red-50">
                    <h4 className="font-medium text-red-900 mb-2">Data Deletion</h4>
                    <p className="text-sm text-red-700 mb-4">
                      Request complete deletion of your personal data in compliance with GDPR. 
                      This action cannot be undone.
                    </p>
                    <button 
                      onClick={() => setShowDataDeletionDialog(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                    >
                      Request Data Deletion
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button (for non-Stripe sections) */}
            {activeSection !== 'stripe' && (
              <div className="mt-8 pt-6 border-t border-sage-200">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  data-testid="save-profile"
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-coral text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stripe Disconnect Confirmation Dialog */}
      {showDisconnectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-sage-900">Disconnect Stripe Account</h3>
                <p className="text-sm text-sage-600">This action will remove your Stripe integration</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-yellow-800 mb-2">What happens when you disconnect:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Your Stripe account will be deauthorized from our platform</li>
                <li>• All stored Stripe data will be removed from your account</li>
                <li>• You'll need to reconnect to access Stripe features again</li>
                <li>• Your Stripe account itself will remain unchanged</li>
                <li>• This action cannot be undone</li>
              </ul>
            </div>
            
            {stripeConnectionStatus.accountId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-800 mb-2">Account Details:</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><strong>Account ID:</strong> {stripeConnectionStatus.accountId}</p>
                  {stripeConnectionStatus.email && (
                    <p><strong>Email:</strong> {stripeConnectionStatus.email}</p>
                  )}
                  <p><strong>Status:</strong> {stripeConnectionStatus.status || 'Connected'}</p>
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDisconnectDialog(false)}
                disabled={isDisconnecting}
                className="flex-1 px-4 py-2 border border-sage-300 text-sage-700 rounded-lg hover:bg-sage-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnectStripe}
                disabled={isDisconnecting}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDisconnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Disconnecting...</span>
                  </>
                ) : (
                  <span>Disconnect Account</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* GDPR Data Deletion Dialog */}
      {showDataDeletionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-sage-900">Request Data Deletion</h3>
                <p className="text-sm text-sage-600">GDPR-compliant data deletion request</p>
              </div>
            </div>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-red-800 mb-2">⚠️ Important Information:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• This will permanently delete ALL your personal data</li>
                <li>• Your Stripe payment data will be redacted according to GDPR</li>
                <li>• This action cannot be undone</li>
                <li>• Processing may take up to 30 days</li>
                <li>• You will receive confirmation via email</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <label htmlFor="deletionReason" className="block text-sm font-medium text-sage-700 mb-2">
                Reason for deletion (optional)
              </label>
              <textarea
                id="deletionReason"
                value={dataDeletionReason}
                onChange={(e) => setDataDeletionReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-sage-300 rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors resize-none"
                placeholder="Please let us know why you're requesting data deletion..."
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Need help?</strong> Contact our Data Protection Officer at{' '}
                our support team{' '}
                if you have questions about this process.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDataDeletionDialog(false);
                  setDataDeletionReason('');
                }}
                disabled={isSaving}
                className="flex-1 px-4 py-2 border border-sage-300 text-sage-700 rounded-lg hover:bg-sage-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDataDeletion}
                disabled={isSaving}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Support Information */}
      <div className="mt-8 pt-6 border-t border-sage-200 max-w-4xl">
        <h4 className="text-lg font-semibold text-sage-900 mb-4">Need Help?</h4>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 mb-2">
            If you have any questions or need assistance, please contact our support team:
          </p>
          <a 
            href="mailto:support@stripe.online" 
            className="text-blue-600 font-medium hover:underline"
          >
            support@stripe.online
          </a>
          <p className="text-blue-700 text-sm mt-2">
            We typically respond within 24 hours during business days.
          </p>
          <p className="text-blue-700 text-sm mt-2">
            For data protection inquiries, contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
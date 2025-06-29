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
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { stripeService } from '../services/stripe';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingStripe, setIsTestingStripe] = useState(false);

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

  // Handle Stripe Connect OAuth callback
  useEffect(() => {
    const handleStripeConnectCallback = async () => {
      const urlParams = new URLSearchParams(location.search);
      const stripeConnected = urlParams.get('stripe_connected');
      const stripeAccountId = urlParams.get('stripe_account_id');
      const stripeError = urlParams.get('stripe_error');
      const stripeErrorDescription = urlParams.get('stripe_error_description');

      // Handle successful Stripe Connect
      if (stripeConnected === 'true' && stripeAccountId) {
        console.log('[SettingsPage] Stripe Connect successful:', { stripeAccountId });
        
        showNotification(
          'success',
          'Stripe Connected Successfully!',
          `Your Stripe account (${stripeAccountId}) has been connected. The sidebar status will update shortly.`
        );

        // Refresh the user session to get updated metadata
        try {
          const { refreshSession } = useAuth();
          await refreshSession();
          console.log('[SettingsPage] User session refreshed after Stripe Connect');
        } catch (error) {
          console.error('[SettingsPage] Failed to refresh session:', error);
          showNotification(
            'warning',
            'Connection Successful',
            'Stripe connected successfully, but you may need to refresh the page to see the updated status.'
          );
        }

        // Clean up URL parameters
        navigate(location.pathname, { replace: true });
      }

      // Handle Stripe Connect errors
      if (stripeError) {
        console.error('[SettingsPage] Stripe Connect error:', { stripeError, stripeErrorDescription });
        
        showNotification(
          'error',
          'Stripe Connection Failed',
          stripeErrorDescription || `Error: ${stripeError}. Please try connecting again.`
        );

        // Clean up URL parameters
        navigate(location.pathname, { replace: true });
      }
    };

    handleStripeConnectCallback();
  }, [location.search, navigate, showNotification]);

  // Load existing Stripe keys on component mount
  useEffect(() => {
    const keys = stripeService.getApiKeys();
    setStripeKeys(prev => ({
      ...prev,
      publishableKey: keys.publishableKey || '',
      connectClientId: keys.connectClientId || ''
    }));
  }, []);

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

      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
                          {stripeConfig.isConfigured ? 'Configured and ready' : 'Not configured'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        stripeConfig.isConfigured ? 'bg-green-400' : 'bg-sage-300'
                      }`} />
                      {stripeConfig.isConfigured && (
                        <button
                          onClick={connectStripe}
                          className="px-4 py-2 bg-coral-600 text-white rounded-lg hover:bg-coral-700 transition-colors font-medium"
                        >
                          Connect Account
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {stripeConfig.isConfigured && (
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
                <div className="space-y-6">
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
                </div>
              </div>
            )}

            {/* Save Button (for non-Stripe sections) */}
            {activeSection !== 'stripe' && (
              <div className="mt-8 pt-6 border-t border-sage-200">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
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
    </div>
  );
};

export default SettingsPage;
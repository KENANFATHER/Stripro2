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
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();

  // Get active section from URL hash or default to 'profile'
  const getActiveSectionFromHash = () => {
    const hash = location.hash.replace('#', '');
    return ['profile', 'stripe', 'notifications', 'security'].includes(hash) ? hash : 'profile';
  };

  const [activeSection, setActiveSection] = useState(getActiveSectionFromHash());
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: user?.user_metadata?.first_name || '',
    lastName: user?.user_metadata?.last_name || '',
    email: user?.email || '',
    company: user?.user_metadata?.company || '',
    timezone: user?.user_metadata?.timezone || 'UTC'
  });

  const [stripeData, setStripeData] = useState({
    apiKey: '',
    webhookSecret: '',
    isLiveMode: false
  });

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    weeklyReports: true,
    monthlyReports: true,
    alertThreshold: 1000
  });

  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    loginAlerts: true
  });

  // Update active section when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setActiveSection(getActiveSectionFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [location.hash]);

  // Navigation handler
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    navigate(`#${section}`, { replace: true });
  };

  // Save handlers
  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showNotification('Settings saved successfully!', 'success');
    } catch (error) {
      showNotification('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStripeApiKeySave = async () => {
    if (!stripeData.apiKey.trim()) {
      showNotification('Please enter a valid Stripe API key', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await stripeService.saveApiKey(stripeData.apiKey, stripeData.isLiveMode);
      showNotification('Stripe API key saved successfully!', 'success');
    } catch (error) {
      showNotification('Failed to save Stripe API key. Please check your key and try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!stripeData.apiKey.trim()) {
      showNotification('Please enter a Stripe API key first', 'error');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const isValid = await stripeService.testConnection(stripeData.apiKey);
      setConnectionStatus(isValid ? 'success' : 'error');
      showNotification(
        isValid ? 'Stripe connection successful!' : 'Failed to connect to Stripe. Please check your API key.',
        isValid ? 'success' : 'error'
      );
    } catch (error) {
      setConnectionStatus('error');
      showNotification('Failed to test Stripe connection. Please try again.', 'error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'stripe', label: 'Stripe Integration', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-sage-900 mb-2">Settings</h1>
          <p className="text-sage-600">Manage your account preferences and integrations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-gradient-coral text-white shadow-lg'
                        : 'text-sage-700 hover:bg-sage-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-sage-900 mb-6">Profile Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                        className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                        className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                        placeholder="Enter your email address"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={profileData.company}
                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                        className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                        placeholder="Enter your company name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={profileData.timezone}
                        onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                        className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                      >
                        <option value="UTC">UTC</option>
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
                  <h2 className="text-2xl font-bold text-sage-900 mb-6">Stripe Integration</h2>
                  
                  {/* API Key Configuration */}
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-medium text-blue-900 mb-1">API Key Setup</h3>
                          <p className="text-blue-700 text-sm">
                            Enter your Stripe API key to connect your account and start analyzing your payment data.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Stripe API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={stripeData.apiKey}
                          onChange={(e) => setStripeData({ ...stripeData, apiKey: e.target.value })}
                          className="w-full px-4 py-3 pr-12 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                          placeholder="sk_test_... or sk_live_..."
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sage-400 hover:text-sage-600"
                        >
                          {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-sage-500 mt-1">
                        Your API key is encrypted and stored securely. We never store your key in plain text.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="liveMode"
                        checked={stripeData.isLiveMode}
                        onChange={(e) => setStripeData({ ...stripeData, isLiveMode: e.target.checked })}
                        className="w-4 h-4 text-coral-600 border-sage-300 rounded focus:ring-coral-500"
                      />
                      <label htmlFor="liveMode" className="text-sm font-medium text-sage-700">
                        Live Mode (Production)
                      </label>
                    </div>

                    {/* Connection Status */}
                    {connectionStatus !== 'idle' && (
                      <div className={`flex items-center space-x-2 p-3 rounded-xl ${
                        connectionStatus === 'success' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {connectionStatus === 'success' ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">
                          {connectionStatus === 'success' 
                            ? 'Connection successful!' 
                            : 'Connection failed. Please check your API key.'}
                        </span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handleTestConnection}
                        disabled={isTestingConnection || !stripeData.apiKey.trim()}
                        className="flex items-center justify-center space-x-2 px-6 py-3 border border-sage-300 text-sage-700 rounded-xl hover:bg-sage-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                      >
                        {isTestingConnection ? (
                          <>
                            <div className="w-4 h-4 border-2 border-sage-400 border-t-transparent rounded-full animate-spin" />
                            <span>Testing...</span>
                          </>
                        ) : (
                          <>
                            <TestTube className="w-4 h-4" />
                            <span>Test Connection</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleStripeApiKeySave}
                        disabled={isSaving || !stripeData.apiKey.trim()}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-coral text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save API Key</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Additional Stripe Settings */}
                    <div className="pt-6 border-t border-sage-200">
                      <h3 className="text-lg font-semibold text-sage-900 mb-4">Webhook Configuration</h3>
                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-2">
                          Webhook Endpoint Secret
                        </label>
                        <input
                          type="password"
                          value={stripeData.webhookSecret}
                          onChange={(e) => setStripeData({ ...stripeData, webhookSecret: e.target.value })}
                          className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                          placeholder="whsec_..."
                        />
                        <p className="text-xs text-sage-500 mt-1">
                          Optional: Add your webhook endpoint secret for real-time data synchronization.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <div>
                  <h2 className="text-2xl font-bold text-sage-900 mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sage-900">Email Notifications</h3>
                        <p className="text-sm text-sage-600">Receive important updates via email</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationData.emailNotifications}
                        onChange={(e) => setNotificationData({ ...notificationData, emailNotifications: e.target.checked })}
                        className="w-4 h-4 text-coral-600 border-sage-300 rounded focus:ring-coral-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sage-900">Weekly Reports</h3>
                        <p className="text-sm text-sage-600">Get weekly profitability summaries</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationData.weeklyReports}
                        onChange={(e) => setNotificationData({ ...notificationData, weeklyReports: e.target.checked })}
                        className="w-4 h-4 text-coral-600 border-sage-300 rounded focus:ring-coral-500"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sage-900">Monthly Reports</h3>
                        <p className="text-sm text-sage-600">Receive detailed monthly analytics</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationData.monthlyReports}
                        onChange={(e) => setNotificationData({ ...notificationData, monthlyReports: e.target.checked })}
                        className="w-4 h-4 text-coral-600 border-sage-300 rounded focus:ring-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Alert Threshold ($)
                      </label>
                      <input
                        type="number"
                        value={notificationData.alertThreshold}
                        onChange={(e) => setNotificationData({ ...notificationData, alertThreshold: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                        placeholder="1000"
                      />
                      <p className="text-xs text-sage-500 mt-1">
                        Get notified when transaction amounts exceed this threshold
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Section */}
              {activeSection === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-sage-900 mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sage-900">Two-Factor Authentication</h3>
                        <p className="text-sm text-sage-600">Add an extra layer of security to your account</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={securityData.twoFactorEnabled}
                        onChange={(e) => setSecurityData({ ...securityData, twoFactorEnabled: e.target.checked })}
                        className="w-4 h-4 text-coral-600 border-sage-300 rounded focus:ring-coral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <select
                        value={securityData.sessionTimeout}
                        onChange={(e) => setSecurityData({ ...securityData, sessionTimeout: parseInt(e.target.value) })}
                        className="w-full px-4 py-3 border border-sage-300 rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-sage-900">Login Alerts</h3>
                        <p className="text-sm text-sage-600">Get notified of new login attempts</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={securityData.loginAlerts}
                        onChange={(e) => setSecurityData({ ...securityData, loginAlerts: e.target.checked })}
                        className="w-4 h-4 text-coral-600 border-sage-300 rounded focus:ring-coral-500"
                      />
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

          {/* Support Information */}
          {activeSection === 'profile' && (
            <div className="lg:col-span-4 mt-8 pt-6 border-t border-sage-200">
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
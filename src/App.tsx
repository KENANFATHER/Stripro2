/**
 * Main Application Component
 * 
 * This is the root component that orchestrates the entire application.
 * It handles routing, authentication state, and provides the main
 * layout structure with context providers.
 * 
 * Features:
 * - Authentication-based routing
 * - Context providers setup
 * - Main layout with responsive sidebar navigation
 * - Page rendering based on active tab
 * - Notification system integration
 * - Mobile-responsive design
 * 
 * Usage:
 * - Entry point for the entire application
 * - Wraps all other components with necessary providers
 * - Handles top-level routing and navigation
 * 
 * Architecture:
 * - Uses context for state management
 * - Implements tab-based navigation
 * - Provides responsive layout structure
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Sidebar, NotificationContainer, BoltBadge } from './components';
import {
  LandingPage,
  AuthCallbackPage,
  DashboardPage, 
  ClientsPage, 
  AddDataPage, 
  SettingsPage,
} from './pages';
import StripeTestPage from './pages/StripeTestPage';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Router-based rendering for authenticated users
  if (user) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50 flex relative">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white border border-sage-200 rounded-lg shadow-md text-sage-600 hover:text-sage-900 hover:bg-sage-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Sidebar Navigation */}
          <Sidebar 
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={toggleSidebarCollapse}
            isMobileOpen={isMobileMenuOpen}
            onToggleMobile={toggleMobileMenu}
          />
          
          {/* Main Content Area */}
          <div className={`flex-1 transition-all duration-300 ease-in-out ${
            isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
          }`}>
            <main className="h-full overflow-y-auto">
              {/* Mobile Header Spacer */}
              <div className="lg:hidden h-16" />
              
              {/* Page Content with Routing */}
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/add-data" element={<AddDataPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  {process.env.NODE_ENV !== 'production' && (
                    <Route path="/stripe-test" element={<StripeTestPage />} />
                  )}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </main>
          </div>
          
          {/* Notification System */}
          <NotificationContainer />
          
          {/* Bolt.new Badge */}
          <BoltBadge />
        </div>
      </Router>
    );
  }

  // Show authentication page if user is not logged in
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
      <BoltBadge />
    </Router>
  );
};

const AppContentLegacy: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Render the appropriate page based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'clients':
        return <ClientsPage />;
      case 'add-data':
        return <AddDataPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  // Show authentication page if user is not logged in
  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white border border-sage-200 rounded-lg shadow-md text-sage-600 hover:text-sage-900 hover:bg-sage-50 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar Navigation */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
        isMobileOpen={isMobileMenuOpen}
        onToggleMobile={toggleMobileMenu}
      />
      
      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'
      }`}>
        <main className="h-full overflow-y-auto">
          {/* Mobile Header Spacer */}
          <div className="lg:hidden h-16" />
          
          {/* Page Content */}
          <div className="min-h-screen">
            {renderContent()}
          </div>
        </main>
      </div>
      
      {/* Notification System */}
      <NotificationContainer />
      
      {/* Bolt.new Badge */}
      <BoltBadge />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <NotificationProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </NotificationProvider>
  );
};

export default App;
/**
 * Sidebar Navigation Component
 * 
 * This component provides the main navigation sidebar for the application.
 * It displays navigation items, user information, and connection status.
 * 
 * Features:
 * - Navigation menu with active state indicators using React Router
 * - User profile display
 * - Stripe connection status
 * - Logout functionality
 * - Responsive design with collapsible sidebar
 * - Mobile-friendly hamburger menu
 * 
 * Usage:
 * - Used in the main layout component
 * - Uses React Router for navigation
 * - Automatically shows user information from auth context
 * 
 * Props:
 * - isCollapsed: Whether sidebar is collapsed
 * - onToggleCollapse: Function to toggle sidebar collapse
 * - isMobileOpen: Whether mobile menu is open
 * - onToggleMobile: Function to toggle mobile menu
 */

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Plus, Settings, LogOut, CreditCard, Users, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  badge?: string | number;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggleCollapse,
  isMobileOpen,
  onToggleMobile
}) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems: NavigationItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'clients', label: 'Clients', icon: Users, path: '/clients' },
    { id: 'add-data', label: 'Add Data', icon: Plus, path: '/add-data' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
    // Add testing page for development/QA
    ...(import.meta.env.DEV ? [{ id: 'testing', label: 'QA Testing', icon: TestTube, path: '/testing' }] : []),
  ];

  const handleLogout = () => {
    logout();
  };

  const handleMenuItemClick = (item: NavigationItem) => {
    navigate(item.path);
    // Close mobile menu when item is selected
    if (isMobileOpen) {
      onToggleMobile();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggleMobile}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
        ${isCollapsed ? 'w-16' : 'w-64'} 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-sage-200 min-h-screen flex flex-col shadow-lg lg:shadow-sm
        transition-all duration-300 ease-in-out
      `}>
        
        {/* Header Section */}
        <div className={`p-4 ${isCollapsed ? 'p-2' : 'p-6'} border-b border-sage-200 transition-all duration-300`}>
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'} transition-all duration-300`}>
              {/* Logo */}
              <div className={`${isCollapsed ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl flex items-center justify-center shadow-sm transition-all duration-300`}>
                <img 
                  src="/Stripro-Logo.png" 
                  alt="Stripro Logo" 
                  className={`${isCollapsed ? 'w-6 h-6' : 'w-10 h-10'} object-contain transition-all duration-300`}
                  onError={(e) => {
                    // Fallback to text logo if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling!.style.display = 'flex';
                  }}
                />
                <div className={`hidden ${isCollapsed ? 'w-6 h-6' : 'w-10 h-10'} bg-gradient-coral rounded-xl items-center justify-center transition-all duration-300`}>
                  <span className={`text-white font-bold ${isCollapsed ? 'text-sm' : 'text-lg'} transition-all duration-300`}>S</span>
                </div>
              </div>
              
              {/* Brand Text */}
              {!isCollapsed && (
                <div className="transition-opacity duration-300">
                  <span className="text-xl font-bold bg-gradient-to-r from-coral-600 via-tangerine-600 to-lilac-600 bg-clip-text text-transparent">
                    Stripro
                  </span>
                  <p className="text-xs text-sage-600 font-medium">Analytics Dashboard</p>
                </div>
              )}
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onToggleMobile}
              className="lg:hidden p-2 text-sage-600 hover:text-sage-900 hover:bg-sage-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:block px-4 py-2">
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-sage-600 hover:text-sage-900 hover:bg-sage-100 rounded-lg transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>
        
        {/* Navigation Menu */}
        <nav className={`flex-1 ${isCollapsed ? 'p-2' : 'p-4'} transition-all duration-300`}>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuItemClick(item)}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-coral-50 via-tangerine-50 to-lilac-50 text-coral-700 border border-coral-200 shadow-sm'
                        : 'text-sage-700 hover:bg-sage-50 hover:text-sage-900'
                    }`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'} ${isActive ? 'text-coral-600' : ''} transition-colors duration-200`} />
                    {!isCollapsed && (
                      <>
                        <span className="font-medium transition-opacity duration-300">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto bg-coral-500 text-white text-xs rounded-full px-2 py-1">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Section */}
        <div className={`border-t border-sage-200 ${isCollapsed ? 'p-2' : 'p-4'} transition-all duration-300`}>
          {/* User Profile */}
          {!isCollapsed && (
            <div className="flex items-center space-x-3 mb-4 transition-opacity duration-300">
              <div className="w-10 h-10 bg-gradient-to-br from-coral-400 via-tangerine-400 to-lilac-400 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sage-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-sage-600 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          
          {/* Logout Button */}
          <div className={`flex items-center ${isCollapsed ? 'justify-center p-2' : 'space-x-2 mb-4 p-3'} bg-white rounded-lg border border-sage-200 transition-all duration-300`}>
            <CreditCard className={`${isCollapsed ? 'w-4 h-4' : 'w-4 h-4'} text-sage-500`} />
            {!isCollapsed && (
              <>
                <span className="text-sm text-sage-700 font-medium">
                  Stripe: {user?.stripeConnected ? 'Connected' : 'Not Connected'}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  user?.stripeConnected ? 'bg-green-400' : 'bg-sage-300'
                }`} />
              </>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'} text-left text-sage-700 hover:bg-white hover:text-sage-900 rounded-lg transition-all duration-200 border border-transparent hover:border-sage-200`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && (
              <span className="font-medium transition-opacity duration-300">Logout</span>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
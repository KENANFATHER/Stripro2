/**
 * Dashboard Page Component
 * 
 * This is the main dashboard page that displays key metrics, charts,
 * and client profitability data. It serves as the primary landing page
 * after user authentication.
 * 
 * Features:
 * - Revenue and profit metrics display
 * - Client profitability table
 * - Interactive charts and graphs
 * - Real-time data updates
 * - Responsive design for all devices
 * 
 * Usage:
 * - Rendered when user navigates to dashboard route
 * - Automatically fetches and displays latest data
 * - Provides navigation to detailed views
 * 
 * Data Sources:
 * - Dashboard statistics from clientService
 * - Client list with profitability metrics
 * - Transaction summaries and trends
 */

import React from 'react';
import { Dashboard } from '../components/Dashboard/Dashboard';

const DashboardPage: React.FC = () => {
  return <Dashboard />;
};

export default DashboardPage;
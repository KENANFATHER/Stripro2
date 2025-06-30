/**
 * Testing Page Component
 * 
 * This page provides a comprehensive testing interface for QA engineers
 * to test and validate button functionality across the application.
 * 
 * Features:
 * - Button testing suite
 * - API integration testing
 * - Stripe functionality testing
 * - Accessibility compliance checking
 * - Performance monitoring
 */

import React, { useState } from 'react';
import { TestTube, Bug, CheckCircle, AlertTriangle, Settings, Database } from 'lucide-react';
import ButtonTester from '../components/UI/ButtonTester';

const TestingPage: React.FC = () => {
  const [activeTestSuite, setActiveTestSuite] = useState('buttons');

  const testSuites = [
    {
      id: 'buttons',
      name: 'Button Testing',
      icon: TestTube,
      description: 'Test all interactive elements and button functionality'
    },
    {
      id: 'api',
      name: 'API Integration',
      icon: Database,
      description: 'Test API endpoints and data integration'
    },
    {
      id: 'stripe',
      name: 'Stripe Integration',
      icon: Settings,
      description: 'Test Stripe connection and payment functionality'
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      icon: CheckCircle,
      description: 'Test accessibility compliance and screen reader support'
    }
  ];

  const renderTestSuite = () => {
    switch (activeTestSuite) {
      case 'buttons':
        return <ButtonTester />;
      case 'api':
        return <APITester />;
      case 'stripe':
        return <StripeTester />;
      case 'accessibility':
        return <AccessibilityTester />;
      default:
        return <ButtonTester />;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-soft min-h-screen">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-coral-600 via-tangerine-600 to-lilac-600 bg-clip-text text-transparent mb-2">
          QA Testing Suite
        </h1>
        <p className="text-sage-600 text-base sm:text-lg">
          Comprehensive testing tools for validating application functionality
        </p>
      </div>

      {/* Test Suite Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {testSuites.map((suite) => {
          const Icon = suite.icon;
          const isActive = activeTestSuite === suite.id;
          
          return (
            <button
              key={suite.id}
              onClick={() => setActiveTestSuite(suite.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                isActive
                  ? 'border-coral-500 bg-coral-50 shadow-lg'
                  : 'border-sage-200 bg-white hover:border-sage-300 hover:shadow-md'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon className={`w-6 h-6 ${isActive ? 'text-coral-600' : 'text-sage-600'}`} />
                <h3 className={`font-semibold ${isActive ? 'text-coral-900' : 'text-sage-900'}`}>
                  {suite.name}
                </h3>
              </div>
              <p className={`text-sm ${isActive ? 'text-coral-700' : 'text-sage-600'}`}>
                {suite.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Test Suite */}
      <div className="bg-white rounded-2xl border border-sage-200 shadow-sm">
        {renderTestSuite()}
      </div>
    </div>
  );
};

// Placeholder components for other test suites
const APITester: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">API Integration Testing</h2>
    <p className="text-gray-600">API testing functionality coming soon...</p>
  </div>
);

const StripeTester: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Stripe Integration Testing</h2>
    <p className="text-gray-600">Stripe testing functionality coming soon...</p>
  </div>
);

const AccessibilityTester: React.FC = () => (
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Accessibility Testing</h2>
    <p className="text-gray-600">Accessibility testing functionality coming soon...</p>
  </div>
);

export default TestingPage;
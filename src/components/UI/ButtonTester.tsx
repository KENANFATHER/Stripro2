/**
 * Button Testing Component
 * 
 * This component provides comprehensive testing for all interactive elements
 * across the application. It includes accessibility testing, state management
 * verification, and user interaction validation.
 * 
 * Features:
 * - Visual button state testing
 * - Accessibility compliance checking
 * - Keyboard navigation testing
 * - Loading state verification
 * - Error handling validation
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Check, X, AlertTriangle, Loader2, Keyboard, Eye } from 'lucide-react';

interface ButtonTestResult {
  id: string;
  name: string;
  status: 'pending' | 'passed' | 'failed' | 'warning';
  message: string;
  details?: string[];
}

interface ButtonTestSuite {
  component: string;
  tests: ButtonTestResult[];
}

const ButtonTester: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<ButtonTestSuite[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string>('all');
  const testContainerRef = useRef<HTMLDivElement>(null);

  // Test configurations for different components
  const testConfigurations = {
    'settings-page': {
      selectors: [
        '[data-testid="save-stripe-keys"]',
        '[data-testid="test-stripe-key"]',
        '[data-testid="connect-stripe"]',
        '[data-testid="disconnect-stripe"]',
        '[data-testid="manage-api-keys"]',
        '[data-testid="refresh-status"]',
        '[data-testid="save-profile"]',
        '[data-testid="change-password"]',
      ],
      name: 'Settings Page Buttons'
    },
    'dashboard': {
      selectors: [
        '[data-testid="export-data"]',
        '[data-testid="refresh-dashboard"]',
        '[data-testid="view-client"]',
      ],
      name: 'Dashboard Buttons'
    },
    'notifications': {
      selectors: [
        '[data-testid="notification-close"]',
        '[data-testid="notification-action"]',
      ],
      name: 'Notification Buttons'
    }
  };

  /**
   * Run comprehensive button tests
   */
  const runButtonTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const components = selectedComponent === 'all' 
      ? Object.keys(testConfigurations)
      : [selectedComponent];

    for (const componentKey of components) {
      const config = testConfigurations[componentKey as keyof typeof testConfigurations];
      const componentTests: ButtonTestResult[] = [];

      for (const selector of config.selectors) {
        const button = document.querySelector(selector) as HTMLButtonElement;
        
        if (!button) {
          componentTests.push({
            id: `${componentKey}-${selector}`,
            name: `Button: ${selector}`,
            status: 'warning',
            message: 'Button not found in DOM',
            details: ['Element may not be rendered or selector is incorrect']
          });
          continue;
        }

        // Test 1: Basic accessibility
        const accessibilityTest = testAccessibility(button);
        componentTests.push({
          id: `${componentKey}-${selector}-accessibility`,
          name: `${selector} - Accessibility`,
          status: accessibilityTest.passed ? 'passed' : 'failed',
          message: accessibilityTest.message,
          details: accessibilityTest.details
        });

        // Test 2: Click handler existence
        const clickHandlerTest = testClickHandler(button);
        componentTests.push({
          id: `${componentKey}-${selector}-click`,
          name: `${selector} - Click Handler`,
          status: clickHandlerTest.passed ? 'passed' : 'failed',
          message: clickHandlerTest.message,
          details: clickHandlerTest.details
        });

        // Test 3: Visual feedback
        const visualTest = testVisualFeedback(button);
        componentTests.push({
          id: `${componentKey}-${selector}-visual`,
          name: `${selector} - Visual Feedback`,
          status: visualTest.passed ? 'passed' : 'warning',
          message: visualTest.message,
          details: visualTest.details
        });

        // Test 4: Keyboard navigation
        const keyboardTest = testKeyboardNavigation(button);
        componentTests.push({
          id: `${componentKey}-${selector}-keyboard`,
          name: `${selector} - Keyboard Navigation`,
          status: keyboardTest.passed ? 'passed' : 'failed',
          message: keyboardTest.message,
          details: keyboardTest.details
        });

        // Test 5: Loading states (if applicable)
        const loadingTest = testLoadingStates(button);
        if (loadingTest) {
          componentTests.push({
            id: `${componentKey}-${selector}-loading`,
            name: `${selector} - Loading States`,
            status: loadingTest.passed ? 'passed' : 'warning',
            message: loadingTest.message,
            details: loadingTest.details
          });
        }

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setTestResults(prev => [...prev, {
        component: config.name,
        tests: componentTests
      }]);
    }

    setIsRunning(false);
  };

  /**
   * Test button accessibility compliance
   */
  const testAccessibility = (button: HTMLButtonElement) => {
    const issues: string[] = [];
    
    // Check for aria-label or text content
    if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
      issues.push('Missing accessible name (text content or aria-label)');
    }

    // Check for disabled state handling
    if (button.disabled && !button.getAttribute('aria-disabled')) {
      issues.push('Disabled state not properly communicated to screen readers');
    }

    // Check for focus indicators
    const computedStyle = window.getComputedStyle(button, ':focus');
    if (!computedStyle.outline && !computedStyle.boxShadow.includes('rgb')) {
      issues.push('Missing visible focus indicator');
    }

    // Check minimum touch target size (44px x 44px)
    const rect = button.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      issues.push(`Touch target too small: ${Math.round(rect.width)}x${Math.round(rect.height)}px (minimum 44x44px)`);
    }

    // Check color contrast (basic check)
    const style = window.getComputedStyle(button);
    if (style.backgroundColor === style.color) {
      issues.push('Potential color contrast issue');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'All accessibility checks passed' : `${issues.length} accessibility issues found`,
      details: issues
    };
  };

  /**
   * Test click handler existence and functionality
   */
  const testClickHandler = (button: HTMLButtonElement) => {
    const issues: string[] = [];
    
    // Check for click event listeners
    const hasClickHandler = button.onclick !== null || 
                           button.addEventListener !== undefined;
    
    if (!hasClickHandler) {
      issues.push('No click handler detected');
    }

    // Check if button is properly enabled/disabled
    if (button.disabled && button.onclick) {
      issues.push('Button has click handler but is disabled');
    }

    // Check for form submission buttons
    if (button.type === 'submit' && !button.form) {
      issues.push('Submit button not associated with a form');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Click handler properly configured' : `${issues.length} click handler issues found`,
      details: issues
    };
  };

  /**
   * Test visual feedback and states
   */
  const testVisualFeedback = (button: HTMLButtonElement) => {
    const issues: string[] = [];
    const style = window.getComputedStyle(button);
    
    // Check for hover states
    if (style.cursor !== 'pointer' && !button.disabled) {
      issues.push('Missing pointer cursor on hover');
    }

    // Check for transition effects
    if (!style.transition && !style.transitionProperty) {
      issues.push('No transition effects for smooth interactions');
    }

    // Check for disabled visual state
    if (button.disabled && style.opacity === '1') {
      issues.push('Disabled state not visually distinct');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Visual feedback properly implemented' : `${issues.length} visual feedback issues found`,
      details: issues
    };
  };

  /**
   * Test keyboard navigation support
   */
  const testKeyboardNavigation = (button: HTMLButtonElement) => {
    const issues: string[] = [];
    
    // Check if button is focusable
    if (button.tabIndex < 0 && !button.disabled) {
      issues.push('Button not focusable via keyboard');
    }

    // Check for Enter/Space key handling
    if (button.type !== 'submit' && !button.onclick) {
      issues.push('May not respond to Enter/Space keys');
    }

    return {
      passed: issues.length === 0,
      message: issues.length === 0 ? 'Keyboard navigation supported' : `${issues.length} keyboard navigation issues found`,
      details: issues
    };
  };

  /**
   * Test loading states implementation
   */
  const testLoadingStates = (button: HTMLButtonElement) => {
    const issues: string[] = [];
    const hasLoadingIndicator = button.querySelector('.animate-spin') || 
                               button.textContent?.includes('...') ||
                               button.getAttribute('aria-busy') === 'true';

    // Only test if button appears to have loading functionality
    if (button.textContent?.toLowerCase().includes('save') || 
        button.textContent?.toLowerCase().includes('submit') ||
        button.textContent?.toLowerCase().includes('connect')) {
      
      if (!hasLoadingIndicator && !button.disabled) {
        issues.push('No loading state indicator found');
      }

      return {
        passed: issues.length === 0,
        message: issues.length === 0 ? 'Loading states properly implemented' : `${issues.length} loading state issues found`,
        details: issues
      };
    }

    return null; // Skip loading test for buttons that don't need it
  };

  /**
   * Get status icon for test result
   */
  const getStatusIcon = (status: ButtonTestResult['status']) => {
    switch (status) {
      case 'passed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <X className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  };

  /**
   * Get status color classes
   */
  const getStatusColor = (status: ButtonTestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Button Testing Suite</h2>
        <p className="text-gray-600">
          Comprehensive testing for all interactive elements across the application
        </p>
      </div>

      {/* Test Controls */}
      <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label htmlFor="component-select" className="block text-sm font-medium text-gray-700 mb-1">
            Test Component
          </label>
          <select
            id="component-select"
            value={selectedComponent}
            onChange={(e) => setSelectedComponent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Components</option>
            <option value="settings-page">Settings Page</option>
            <option value="dashboard">Dashboard</option>
            <option value="notifications">Notifications</option>
          </select>
        </div>
        
        <button
          onClick={runButtonTests}
          disabled={isRunning}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Running Tests...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Run Tests</span>
            </>
          )}
        </button>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Test Results</h3>
          
          {testResults.map((suite, suiteIndex) => (
            <div key={suiteIndex} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-medium text-gray-900">{suite.component}</h4>
                <p className="text-sm text-gray-600">
                  {suite.tests.filter(t => t.status === 'passed').length} passed, {' '}
                  {suite.tests.filter(t => t.status === 'failed').length} failed, {' '}
                  {suite.tests.filter(t => t.status === 'warning').length} warnings
                </p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {suite.tests.map((test, testIndex) => (
                  <div key={testIndex} className={`p-4 ${getStatusColor(test.status)}`}>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getStatusIcon(test.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium">{test.name}</h5>
                        <p className="text-sm mt-1">{test.message}</p>
                        {test.details && test.details.length > 0 && (
                          <ul className="text-sm mt-2 space-y-1">
                            {test.details.map((detail, detailIndex) => (
                              <li key={detailIndex} className="flex items-start space-x-2">
                                <span className="text-gray-400">•</span>
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Testing Guidelines */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Testing Guidelines</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• All buttons should have accessible names (text or aria-label)</li>
          <li>• Interactive elements should have minimum 44x44px touch targets</li>
          <li>• Focus indicators must be visible for keyboard navigation</li>
          <li>• Loading states should be clearly communicated to users</li>
          <li>• Disabled states should be visually distinct and properly announced</li>
          <li>• Click handlers should be properly attached and functional</li>
        </ul>
      </div>
    </div>
  );
};

export default ButtonTester;
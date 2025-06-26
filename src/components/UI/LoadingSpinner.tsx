/**
 * Loading Spinner Component
 * 
 * This component displays a customizable loading spinner with optional
 * text and different sizes. Used throughout the application for loading
 * states and async operations.
 * 
 * Features:
 * - Multiple size options (small, medium, large)
 * - Optional loading text
 * - Customizable colors
 * - Smooth animations
 * - Accessible with proper ARIA labels
 * 
 * Usage:
 * - Use in buttons, forms, and page loading states
 * - Customize size and text as needed
 * - Provides consistent loading experience
 * 
 * Props:
 * - size: Size of the spinner (small, medium, large)
 * - text: Optional loading text to display
 * - className: Additional CSS classes
 */

import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  text,
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4 border-2';
      case 'large':
        return 'w-12 h-12 border-4';
      default:
        return 'w-8 h-8 border-4';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <div 
          className={`${getSizeClasses()} border-blue-600 border-t-transparent rounded-full animate-spin`}
          role="status"
          aria-label="Loading"
        />
        {text && (
          <span className={`text-gray-600 ${getTextSize()}`}>
            {text}
          </span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
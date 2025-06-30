/**
 * Google reCAPTCHA Component
 * 
 * This component integrates Google reCAPTCHA v2 to prevent automated
 * bot attacks on authentication forms. It provides an additional
 * security layer beyond standard form validation.
 * 
 * Security Features:
 * - Bot detection and prevention
 * - Human verification challenge
 * - Token-based verification system
 * - Automatic token expiration
 * 
 * Usage:
 * - Include in authentication forms
 * - Verify token on form submission
 * - Reset after form submission or errors
 * 
 * Security Benefits:
 * - Prevents automated account creation
 * - Reduces spam and abuse
 * - Protects against brute force attacks
 * - Validates human interaction
 * 
 * Note: This is a mock implementation for demo purposes.
 * In production, you would use the actual Google reCAPTCHA library.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Shield, RefreshCw } from 'lucide-react';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  theme?: 'light' | 'dark';
  size?: 'normal' | 'compact';
  className?: string;
}

const ReCaptcha: React.FC<ReCaptchaProps> = ({
  onVerify,
  onExpire,
  theme = 'light',
  size = 'normal',
  className = ''
}) => {
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Simulates reCAPTCHA verification process
   * In production, this would integrate with Google's reCAPTCHA API
   */
  const handleVerification = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate network delay for reCAPTCHA verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate random verification success/failure for demo
      const isSuccess = Math.random() > 0.1; // 90% success rate
      
      if (isSuccess) {
        const mockToken = `mock-recaptcha-token-${Date.now()}`;
        setIsVerified(true);
        onVerify(mockToken);
        
        // Set expiration timer (reCAPTCHA tokens typically expire after 2 minutes)
        timeoutRef.current = setTimeout(() => {
          handleExpiration();
        }, 120000); // 2 minutes
        
      } else {
        throw new Error('Verification failed. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      onVerify(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles token expiration
   * Security: Ensures tokens don't remain valid indefinitely
   */
  const handleExpiration = () => {
    setIsVerified(false);
    onVerify(null);
    if (onExpire) {
      onExpire();
    }
  };

  /**
   * Resets the reCAPTCHA widget
   * Security: Allows users to retry verification
   */
  const handleReset = () => {
    setIsVerified(false);
    setError(null);
    onVerify(null);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`${className}`}>
      <div className={`border-2 rounded-lg p-4 transition-colors ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-600' 
          : 'bg-gray-50 border-gray-200'
      } ${size === 'compact' ? 'p-3' : 'p-4'}`}>
        
        {/* reCAPTCHA Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Shield className={`w-5 h-5 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`} />
            <span className={`text-sm font-medium ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Security Verification
            </span>
          </div>
          
          {isVerified && (
            <button
              onClick={handleReset}
              className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
              title="Reset verification"
            >
              <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Verification Status */}
        {!isVerified && !isLoading && !error && (
          <div className="text-center">
            <button
              onClick={handleVerification}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              I'm not a robot
            </button>
            <p className={`text-xs mt-2 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Click to verify you're human
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-2">
            <div className="inline-flex items-center space-x-2">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Verifying...
              </span>
            </div>
          </div>
        )}

        {/* Success State */}
        {isVerified && (
          <div className="text-center py-2">
            <div className="inline-flex items-center space-x-2 text-green-600">
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-sm font-medium">Verified</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-2">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <button
              onClick={handleVerification}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* reCAPTCHA Branding (Required by Google) */}
        <div className={`text-xs mt-3 pt-2 border-t ${
          theme === 'dark' 
            ? 'border-gray-600 text-gray-400' 
            : 'border-gray-200 text-gray-500'
        }`}>
          <div className="flex items-center justify-between">
            <span>Protected by reCAPTCHA</span>
            <div className="flex space-x-2">
              <a href="#" className="hover:underline">Privacy</a>
              <span>•</span>
              <a href="#" className="hover:underline">Terms</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReCaptcha;
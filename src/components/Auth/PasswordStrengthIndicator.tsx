/**
 * Password Strength Indicator Component
 * 
 * This component provides real-time visual feedback about password strength
 * to help users create secure passwords. It displays a progress bar and
 * descriptive text based on password complexity.
 * 
 * Security Features:
 * - Real-time strength calculation
 * - Visual feedback with color coding
 * - Encourages strong password creation
 * - No password data is stored or transmitted
 * 
 * Usage:
 * - Include in password input forms
 * - Pass current password value as prop
 * - Automatically updates as user types
 * 
 * Security Benefits:
 * - Educates users about password security
 * - Reduces likelihood of weak passwords
 * - Provides immediate feedback for improvement
 */

import React from 'react';
import { getPasswordStrength } from '../../utils/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ 
  password, 
  className = '' 
}) => {
  const { score, label, color } = getPasswordStrength(password);
  
  // Don't show indicator if no password entered
  if (!password) {
    return null;
  }
  
  // Calculate width percentage based on score
  const widthPercentage = (score / 4) * 100;
  
  return (
    <div className={`mt-2 ${className}`}>
      {/* Strength Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${color}`}
          style={{ width: `${widthPercentage}%` }}
        />
      </div>
      
      {/* Strength Label */}
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600">Password Strength:</span>
        <span className={`text-xs font-medium ${
          score <= 1 ? 'text-red-600' :
          score <= 2 ? 'text-yellow-600' :
          score <= 3 ? 'text-blue-600' :
          'text-green-600'
        }`}>
          {label}
        </span>
      </div>
      
      {/* Security Tips for Weak Passwords */}
      {score < 3 && (
        <div className="mt-2 text-xs text-gray-500">
          <p>Tips for a stronger password:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            {password.length < 8 && <li>Use at least 8 characters</li>}
            {!/[a-z]/.test(password) && <li>Include lowercase letters</li>}
            {!/[A-Z]/.test(password) && <li>Include uppercase letters</li>}
            {!/\d/.test(password) && <li>Include numbers</li>}
            {!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password) && <li>Include special characters</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
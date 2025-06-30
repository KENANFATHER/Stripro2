/**
 * Forgot Password Form Component (Code Splitting Example)
 * 
 * This component demonstrates how to implement code splitting for
 * features that are not immediately needed. It's lazy-loaded only
 * when the user requests password reset functionality.
 * 
 * Accessibility Features:
 * - Semantic form structure
 * - Proper ARIA attributes
 * - Focus management
 * - Screen reader announcements
 * 
 * Code Splitting Benefits:
 * - Reduces initial bundle size
 * - Loads only when needed
 * - Improves page load performance
 */

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Mail, CheckCircle, AlertTriangle } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack: () => void;
  onSuccess?: (email: string) => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBack,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Accessibility: Refs for focus management
  const emailInputRef = useRef<HTMLInputElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  // Accessibility: Focus management on component mount
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Accessibility: Announce status changes
  useEffect(() => {
    if (announcementRef.current) {
      if (isSubmitted) {
        announcementRef.current.textContent = 'Password reset email sent successfully';
      } else if (error) {
        announcementRef.current.textContent = `Error: ${error}`;
      }
    }
  }, [isSubmitted, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email address is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Real API call for password reset
      await apiClient.post('/auth/password-reset', { email });
      
      setIsSubmitted(true);
      onSuccess?.(email);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-sage-900">Check your email</h2>
        <p className="text-sage-600">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <button
          onClick={onBack}
          className="text-coral-600 hover:text-coral-500 font-semibold"
        >
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Accessibility: ARIA live region for announcements */}
      <div 
        ref={announcementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-sage-900 mb-2">Reset your password</h2>
        <p className="text-sage-600">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-semibold text-sage-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-sage-400" />
            <input
              ref={emailInputRef}
              type="email"
              id="reset-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-describedby={error ? 'email-error' : undefined}
              aria-invalid={!!error}
              className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors ${
                error ? 'border-red-300 bg-red-50' : 'border-sage-300'
              }`}
              placeholder="Enter your email address"
            />
          </div>
          {error && (
            <div id="email-error" role="alert" className="flex items-center space-x-1 mt-1">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">{error}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 bg-gradient-coral text-white rounded-xl font-semibold hover:shadow-lg focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isSubmitting ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-sage-600 hover:text-sage-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to sign in</span>
      </button>
    </div>
  );
};

export default ForgotPasswordForm;
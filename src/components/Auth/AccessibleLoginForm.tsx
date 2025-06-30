/**
 * Accessible Login Form Component with Code Splitting
 * 
 * This component demonstrates best practices for accessibility in React forms:
 * - Semantic HTML structure with proper form elements
 * - ARIA attributes for screen reader compatibility
 * - Keyboard navigation support
 * - Focus management and error announcements
 * - Progressive enhancement with JavaScript
 * 
 * Code Splitting Features:
 * - Lazy loading of heavy validation utilities
 * - Dynamic imports for non-critical components
 * - Optimized bundle size through selective imports
 * 
 * Accessibility Improvements:
 * - Proper form labeling and fieldset grouping
 * - ARIA live regions for dynamic content updates
 * - High contrast focus indicators
 * - Screen reader announcements for state changes
 * - Keyboard-only navigation support
 */

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { Eye, EyeOff, AlertTriangle, CheckCircle, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { LoginCredentials, SignupCredentials } from '../../types';
import GoogleSignInButton from './GoogleSignInButton';

// Code Splitting: Lazy load success icon
const CheckCircleIcon = lazy(() => import('lucide-react').then(module => ({ default: module.CheckCircle })));

// Code Splitting: Lazy load heavy validation utilities
// This reduces the initial bundle size by loading validation logic only when needed
const validateEmailAsync = lazy(() => 
  import('../../utils/validation').then(module => ({ 
    default: module.validateEmail 
  }))
);

const validatePasswordAsync = lazy(() => 
  import('../../utils/validation').then(module => ({ 
    default: module.validatePassword 
  }))
);

// Code Splitting: Lazy load password strength indicator
// This component is only needed during signup, so we load it dynamically
const PasswordStrengthIndicator = lazy(() => 
  import('./PasswordStrengthIndicator')
);

// Code Splitting: Lazy load reCAPTCHA component
// Security component loaded only when form is ready for submission
const ReCaptcha = lazy(() => 
  import('./ReCaptcha')
);

interface AccessibleLoginFormProps {
  /** Initial form mode - login or signup */
  initialMode?: 'login' | 'signup';
  /** Callback when authentication is successful */
  onSuccess?: () => void;
  /** Additional CSS classes */
  className?: string;
}

const AccessibleLoginForm: React.FC<AccessibleLoginFormProps> = ({
  initialMode = 'login',
  onSuccess,
  className = ''
}) => {
  // Form state management
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [signupSuccessMessage, setSignupSuccessMessage] = useState<string | null>(null);

  // Form data state with proper typing
  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState<SignupCredentials>({
    name: '',
    email: '',
    password: ''
  });

  // Validation state with accessibility-friendly error messages
  const [validation, setValidation] = useState({
    email: { isValid: true, message: '', hasError: false },
    password: { isValid: true, message: '', hasError: false },
    name: { isValid: true, message: '', hasError: false }
  });

  // Form-level error state
  const [formError, setFormError] = useState('');

  // Accessibility: Refs for focus management
  const formRef = useRef<HTMLFormElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const errorAnnouncementRef = useRef<HTMLDivElement>(null);
  const successAnnouncementRef = useRef<HTMLDivElement>(null);

  // Authentication and notification hooks
  const { login, signup, isLoading } = useAuth();
  const { showNotification } = useNotification();

  /**
   * Accessibility: Focus management when form mode changes
   * Ensures keyboard users don't lose focus context
   */
  useEffect(() => {
    if (firstInputRef.current) {
      // Small delay to ensure DOM updates are complete
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [isLogin]);

  /**
   * Accessibility: Announce errors to screen readers
   * Uses ARIA live region to communicate dynamic content changes
   */
  useEffect(() => {
    if (formError && errorAnnouncementRef.current) {
      // Announce error to screen readers
      errorAnnouncementRef.current.textContent = `Error: ${formError}`;
    }
  }, [formError]);

  /**
   * Code Splitting: Dynamic validation with lazy loading
   * Loads validation utilities only when needed to reduce initial bundle size
   */
  const validateFieldAsync = async (
    field: 'email' | 'password' | 'name',
    value: string
  ) => {
    try {
      let result = { isValid: true, message: '' };

      if (field === 'email') {
        // Dynamic import for email validation
        const { validateEmail } = await import('../../utils/validation');
        result = validateEmail(value);
      } else if (field === 'password') {
        // Dynamic import for password validation
        const { validatePassword } = await import('../../utils/validation');
        result = validatePassword(value);
      } else if (field === 'name') {
        // Dynamic import for name validation
        const { validateName } = await import('../../utils/validation');
        result = validateName(value);
      }

      setValidation(prev => ({
        ...prev,
        [field]: {
          ...result,
          hasError: !result.isValid
        }
      }));

      return result.isValid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  };

  /**
   * Accessibility: Enhanced input change handler with validation
   * Provides immediate feedback for better user experience
   */
  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: 'login' | 'signup'
  ) => {
    const { name, value } = e.target;
    
    // Update form data
    if (formType === 'login') {
      setLoginData(prev => ({ ...prev, [name]: value }));
    } else {
      setSignupData(prev => ({ ...prev, [name]: value }));
    }

    // Clear form-level error when user starts typing
    if (formError) {
      setFormError('');
    }

    // Debounced validation for better performance
    // Only validate after user stops typing for 500ms
    const timeoutId = setTimeout(() => {
      validateFieldAsync(name as 'email' | 'password' | 'name', value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  /**
   * Accessibility: Enhanced form submission with proper error handling
   * Includes comprehensive validation and user feedback
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Accessibility: Announce form submission to screen readers
    if (successAnnouncementRef.current) {
      successAnnouncementRef.current.textContent = 'Submitting form...';
    }

    // Rate limiting check
    if (attemptCount >= 5) {
      const errorMsg = 'Too many attempts. Please wait before trying again.';
      setFormError(errorMsg);
      showNotification('error', 'Rate Limited', errorMsg);
      return;
    }

    // Validate all fields before submission
    const currentData = isLogin ? loginData : signupData;
    const fieldsToValidate: Array<'email' | 'password' | 'name'> = ['email', 'password'];
    if (!isLogin) fieldsToValidate.push('name');

    let isFormValid = true;
    for (const field of fieldsToValidate) {
      const fieldValue = currentData[field as keyof typeof currentData] as string;
      const isValid = await validateFieldAsync(field, fieldValue);
      if (!isValid) isFormValid = false;
    }

    // Check reCAPTCHA verification
    if (!recaptchaToken) {
      setFormError('Please complete the security verification');
      return;
    }

    if (!isFormValid) {
      setFormError('Please correct the errors above');
      setAttemptCount(prev => prev + 1);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      let authResult: { success: boolean; requiresMFA?: boolean; requiresEmailVerification?: boolean };
      
      if (isLogin) {
        authResult = await login(loginData);
        
        // Only proceed with success callback if login is complete (no MFA required)
        if (authResult.success && !authResult.requiresMFA) {
          // Accessibility: Announce success
          if (successAnnouncementRef.current) {
            successAnnouncementRef.current.textContent = 'Login successful! Welcome back.';
          }
          
          // Reset attempt count on success
          setAttemptCount(0);
          
          // Call success callback to trigger redirect
          onSuccess?.();
        } else if (authResult.requiresMFA) {
          // MFA required - show appropriate message but don't redirect
          if (successAnnouncementRef.current) {
            successAnnouncementRef.current.textContent = 'Please enter your two-factor authentication code.';
          }
        }
      } else {
        authResult = await signup(signupData);
        
        // Only proceed with success callback if signup is complete (no email verification required)
        if (authResult.success && !authResult.requiresEmailVerification) {
          // Accessibility: Announce success
          if (successAnnouncementRef.current) {
            successAnnouncementRef.current.textContent = 'Account created successfully! Welcome to Stripro.';
          }
          
          // Reset attempt count on success
          setAttemptCount(0);
          
          // Call success callback to trigger redirect
          onSuccess?.();
        } else if (authResult.requiresEmailVerification) {
          // Email verification required - show appropriate message but don't redirect
          if (successAnnouncementRef.current) {
            successAnnouncementRef.current.textContent = 'Account created! Please check your email to verify your account before signing in.';
          }
          
          // Set success message to display in the UI
          setSignupSuccessMessage(`We've sent a verification link to ${signupData.email}. Please check your email and click the link to activate your account.`);
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setFormError(errorMessage);
      setAttemptCount(prev => prev + 1);
      
      // Reset reCAPTCHA on error
      setRecaptchaToken(null);
      
      showNotification('error', 'Authentication Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Accessibility: Enhanced mode toggle with proper announcements
   * Ensures screen readers understand the context change
   */
  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    setFormError('');
    setRecaptchaToken(null);
    setSignupSuccessMessage(null);
    setAttemptCount(0);
    
    // Reset form data
    setLoginData({ email: '', password: '' });
    setSignupData({ name: '', email: '', password: '' });
    
    // Reset validation state
    setValidation({
      email: { isValid: true, message: '', hasError: false },
      password: { isValid: true, message: '', hasError: false },
      name: { isValid: true, message: '', hasError: false }
    });

    // Accessibility: Announce mode change
    if (successAnnouncementRef.current) {
      successAnnouncementRef.current.textContent = 
        `Switched to ${newMode ? 'login' : 'signup'} form`;
    }
  };

  /**
   * Accessibility: Enhanced password visibility toggle
   * Includes proper ARIA attributes and announcements
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prev => {
      const newState = !prev;
      // Announce password visibility change to screen readers
      if (successAnnouncementRef.current) {
        successAnnouncementRef.current.textContent = 
          `Password is now ${newState ? 'visible' : 'hidden'}`;
      }
      return newState;
    });
  };

  /**
   * Accessibility: Handle reCAPTCHA verification
   * Includes proper announcements for verification state
   */
  const handleRecaptchaVerify = (token: string | null) => {
    setRecaptchaToken(token);
    if (successAnnouncementRef.current) {
      successAnnouncementRef.current.textContent = 
        token ? 'Security verification completed' : 'Security verification required';
    }
  };

  // Get current form data for validation checks
  const currentData = isLogin ? loginData : signupData;
  const isFormValid = validation.email.isValid && validation.password.isValid && 
    (isLogin || validation.name.isValid) && recaptchaToken;

  return (
    <div className={`w-full ${className}`}>
      {/* Accessibility: ARIA live regions for announcements */}
      <div
        ref={errorAnnouncementRef}
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
      <div
        ref={successAnnouncementRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      />

      {/* Accessibility: Main form with proper semantics and ARIA attributes */}
      <main className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/30 shadow-2xl">
        {signupSuccessMessage ? (
          /* Email Verification Success Screen */
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center text-center">
            <Suspense fallback={<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center" />}>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
            </Suspense>
            
            <h2 className="text-xl sm:text-2xl font-bold text-sage-900 mb-3">
              Check Your Email
            </h2>
            
            <p className="text-sage-700 mb-4 max-w-sm">
              {signupSuccessMessage}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 max-w-sm">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> If you don't see the email in your inbox, please check your spam or junk folder.
              </p>
            </div>
            
            <button
              onClick={() => {
                setIsLogin(true);
                setSignupSuccessMessage(null);
                setLoginData(prev => ({ ...prev, email: signupData.email }));
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-coral text-white rounded-lg font-semibold hover:shadow-lg focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 transition-all duration-200"
            >
              <span>Back to Sign In</span>
            </button>
          </div>
        ) : (
          /* Regular Login/Signup Form */
          <div className="p-4 sm:p-5 lg:p-6">
            {/* Security Notice */}
            <section 
              className="bg-sage-50 border border-sage-200 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4 lg:mb-5"
              aria-labelledby="security-notice-heading"
            >
              <div className="flex items-start space-x-3">
                <Shield className="w-3 sm:w-4 h-3 sm:h-4 text-sage-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div>
                  <h3 id="security-notice-heading" className="text-xs sm:text-sm font-semibold text-sage-800">
                    Enterprise Security
                  </h3>
                  <p className="text-xs text-sage-600 mt-1">
                    Your data is protected with bank-level encryption, validation, and bot protection.
                  </p>
                </div>
              </div>
            </section>

            <form 
              ref={formRef}
              onSubmit={handleSubmit} 
              className="space-y-3 sm:space-y-4 lg:space-y-5"
              noValidate // We handle validation ourselves for better UX
              aria-labelledby="form-heading"
            >
              {/* Accessibility: Hidden heading for screen readers */}
              <h2 id="form-heading" className="sr-only">
                {isLogin ? 'Sign in to your account' : 'Create a new account'}
              </h2>

              {/* Accessibility: Fieldset for grouping related form controls */}
              <fieldset className="space-y-3 sm:space-y-4 lg:space-y-5">
                <legend className="sr-only">
                  {isLogin ? 'Login credentials' : 'Account information'}
                </legend>

                {/* Name field for signup - with proper accessibility */}
                {!isLogin && (
                  <div>
                    <label 
                      htmlFor="signup-name" 
                      className="block text-xs sm:text-sm font-semibold text-sage-700 mb-1"
                    >
                      Full Name *
                    </label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      id="signup-name"
                      name="name"
                      value={signupData.name}
                      onChange={(e) => handleInputChange(e, 'signup')}
                      required
                      autoComplete="name"
                      aria-describedby={validation.name.hasError ? 'name-error' : undefined}
                      aria-invalid={validation.name.hasError}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors text-sm ${
                        validation.name.hasError ? 'border-red-300 bg-red-50' : 'border-sage-300'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {/* Accessibility: Error message with proper ARIA association */}
                    {validation.name.hasError && (
                      <div 
                        id="name-error"
                        role="alert"
                        className="flex items-center space-x-1 mt-1"
                      >
                        <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" aria-hidden="true" />
                        <span className="text-xs text-red-600">{validation.name.message}</span>
                      </div>
                    )}
                    {/* Accessibility: Success indicator */}
                    {validation.name.isValid && signupData.name && !validation.name.hasError && (
                      <div className="flex items-center space-x-1 mt-1">
                        <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" aria-hidden="true" />
                        <span className="text-xs text-green-600">Valid name</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Email field - with enhanced accessibility */}
                <div>
                  <label 
                    htmlFor={isLogin ? 'login-email' : 'signup-email'} 
                    className="block text-xs sm:text-sm font-semibold text-sage-700 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    ref={isLogin ? firstInputRef : undefined}
                    type="email"
                    id={isLogin ? 'login-email' : 'signup-email'}
                    name="email"
                    value={currentData.email}
                    onChange={(e) => handleInputChange(e, isLogin ? 'login' : 'signup')}
                    required
                    autoComplete="email"
                    aria-describedby={validation.email.hasError ? 'email-error' : undefined}
                    aria-invalid={validation.email.hasError}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors text-sm ${
                      validation.email.hasError ? 'border-red-300 bg-red-50' : 'border-sage-300'
                    }`}
                    placeholder="Enter your email"
                  />
                  {/* Accessibility: Error message with proper ARIA association */}
                  {validation.email.hasError && (
                    <div 
                      id="email-error"
                      role="alert"
                      className="flex items-center space-x-1 mt-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-red-600">{validation.email.message}</span>
                    </div>
                  )}
                  {/* Accessibility: Success indicator */}
                  {validation.email.isValid && currentData.email && !validation.email.hasError && (
                    <div className="flex items-center space-x-1 mt-1">
                      <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-green-600">Valid email address</span>
                    </div>
                  )}
                </div>

                {/* Password field - with enhanced accessibility and security */}
                <div>
                  <label 
                    htmlFor={isLogin ? 'login-password' : 'signup-password'} 
                    className="block text-xs sm:text-sm font-semibold text-sage-700 mb-1"
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id={isLogin ? 'login-password' : 'signup-password'}
                      name="password"
                      value={currentData.password}
                      onChange={(e) => handleInputChange(e, isLogin ? 'login' : 'signup')}
                      required
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      aria-describedby={`${isLogin ? 'login' : 'signup'}-password-description ${validation.password.hasError ? 'password-error' : ''}`}
                      aria-invalid={validation.password.hasError}
                      className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-coral-500 focus:border-transparent transition-colors text-sm ${
                        validation.password.hasError ? 'border-red-300 bg-red-50' : 'border-sage-300'
                      }`}
                      placeholder="Enter your password"
                    />
                    {/* Accessibility: Enhanced password visibility toggle */}
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showPassword}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-sage-400 hover:text-sage-600 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 rounded transition-colors"
                    >
                      {showPassword ? 
                        <EyeOff className="w-4 h-4" aria-hidden="true" /> : 
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      }
                    </button>
                  </div>
                  
                  {/* Accessibility: Password requirements description */}
                  <div 
                    id={`${isLogin ? 'login' : 'signup'}-password-description`}
                    className="text-xs text-sage-600 mt-1"
                  >
                    {!isLogin && 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.'}
                  </div>

                  {/* Accessibility: Error message with proper ARIA association */}
                  {validation.password.hasError && (
                    <div 
                      id="password-error"
                      role="alert"
                      className="flex items-center space-x-1 mt-1"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" aria-hidden="true" />
                      <span className="text-xs text-red-600">{validation.password.message}</span>
                    </div>
                  )}
                  
                  {/* Code Splitting: Lazy load password strength indicator for signup */}
                  {!isLogin && (
                    <Suspense fallback={<div className="text-xs text-sage-500 mt-1">Loading password strength indicator...</div>}>
                      <PasswordStrengthIndicator password={signupData.password} />
                    </Suspense>
                  )}
                </div>
              </fieldset>

              {/* Code Splitting: Lazy load reCAPTCHA component */}
              <div>
                <Suspense fallback={
                  <div className="flex items-center justify-center p-2 sm:p-3 border border-sage-200 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin text-sage-500" />
                    <span className="ml-2 text-xs text-sage-600">Loading security verification...</span>
                  </div>
                }>
                  <ReCaptcha
                    onVerify={handleRecaptchaVerify}
                    onExpire={() => setRecaptchaToken(null)}
                    theme="light"
                    size="normal"
                  />
                </Suspense>
              </div>

              {/* Accessibility: Form-level error display with proper semantics */}
              {formError && (
                <div 
                  role="alert"
                  aria-live="assertive"
                  className="bg-red-50 border border-red-200 rounded-lg p-2"
                >
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <p className="text-xs text-red-600">{formError}</p>
                  </div>
                </div>
              )}

              {/* Accessibility: Rate limiting warning */}
              {attemptCount >= 3 && (
                <div 
                  role="alert"
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-2"
                >
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <p className="text-xs text-yellow-700">
                      Multiple failed attempts detected. {5 - attemptCount} attempts remaining.
                    </p>
                  </div>
                </div>
              )}

              {/* Accessibility: Enhanced submit button with proper states */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading || isSubmitting || !isFormValid}
                  aria-describedby="submit-button-description"
                  className="w-full py-2 px-4 bg-gradient-coral text-white rounded-lg font-semibold hover:shadow-lg focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm min-h-[40px]"
                >
                  {isLoading || isSubmitting ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                    </span>
                  ) : (
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  )}
                </button>
              </div>
              
              {/* Accessibility: Submit button description */}
              <div id="submit-button-description" className="sr-only">
                {!isFormValid && 'Please complete all required fields and security verification before submitting'}
              </div>

              {/* OAuth Divider */}
              <div className="relative my-2 sm:my-3 lg:my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-sage-300" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-sage-600 font-medium">Or continue with</span>
                </div>
              </div>

              {/* Google Sign-In Button */}
              <GoogleSignInButton
                onSuccess={onSuccess}
                onError={(error) => {
                  setFormError(error);
                  showNotification('error', 'Google Sign-In Failed', error);
                }}
                disabled={isLoading || isSubmitting}
              />
            </form>

            {/* Accessibility: Enhanced mode toggle with proper semantics */}
            <div className="mt-4 sm:mt-5 lg:mt-6 text-center">
              <p className="text-xs text-sage-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-1 text-coral-600 hover:text-coral-500 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 rounded px-1 text-xs"
                  aria-describedby="mode-toggle-description"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
              <div id="mode-toggle-description" className="sr-only text-xs">
                Switch to {isLogin ? 'create a new account' : 'sign in with existing account'}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AccessibleLoginForm;
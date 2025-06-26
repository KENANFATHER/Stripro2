/**
 * Form Validation Utilities
 * 
 * This module provides comprehensive client-side validation functions
 * for authentication forms. It includes email validation, password
 * strength checking, and input sanitization for security.
 * 
 * Security Features:
 * - Email format validation using RFC-compliant regex
 * - Password strength requirements (length, complexity)
 * - Input sanitization to prevent XSS attacks
 * - Real-time validation feedback
 * 
 * Usage:
 * - Import validation functions in form components
 * - Call validateEmail() and validatePassword() on input changes
 * - Use sanitizeInput() for all user inputs
 * 
 * Security Benefits:
 * - Prevents weak passwords that are easily compromised
 * - Validates email format to reduce invalid registrations
 * - Sanitizes inputs to prevent script injection attacks
 */

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

/**
 * Validates email format using RFC 5322 compliant regex
 * Security: Prevents invalid email formats and potential injection attacks
 */
export const validateEmail = (email: string): ValidationResult => {
  // Sanitize input first
  const sanitizedEmail = sanitizeInput(email);
  
  // RFC 5322 compliant email regex (simplified but secure)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!sanitizedEmail) {
    return {
      isValid: false,
      message: 'Email is required'
    };
  }
  
  if (sanitizedEmail.length > 254) {
    return {
      isValid: false,
      message: 'Email is too long'
    };
  }
  
  if (!emailRegex.test(sanitizedEmail)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address'
    };
  }
  
  return {
    isValid: true,
    message: 'Valid email address'
  };
};

/**
 * Validates password strength with comprehensive security requirements
 * Security: Enforces strong passwords to prevent brute force attacks
 */
export const validatePassword = (password: string): ValidationResult => {
  // Don't sanitize password as it may contain special characters intentionally
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }
  
  // Minimum length requirement (security best practice)
  if (password.length < 8) {
    return {
      isValid: false,
      message: 'Password must be at least 8 characters long'
    };
  }
  
  // Maximum length to prevent DoS attacks
  if (password.length > 128) {
    return {
      isValid: false,
      message: 'Password is too long (max 128 characters)'
    };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one lowercase letter'
    };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one uppercase letter'
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return {
      isValid: false,
      message: 'Password must contain at least one special character'
    };
  }
  
  return {
    isValid: true,
    message: 'Strong password'
  };
};

/**
 * Validates name field with security considerations
 * Security: Prevents injection attacks and ensures reasonable input
 */
export const validateName = (name: string): ValidationResult => {
  const sanitizedName = sanitizeInput(name);
  
  if (!sanitizedName) {
    return {
      isValid: false,
      message: 'Name is required'
    };
  }
  
  if (sanitizedName.length < 2) {
    return {
      isValid: false,
      message: 'Name must be at least 2 characters long'
    };
  }
  
  if (sanitizedName.length > 50) {
    return {
      isValid: false,
      message: 'Name is too long (max 50 characters)'
    };
  }
  
  // Allow only letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(sanitizedName)) {
    return {
      isValid: false,
      message: 'Name can only contain letters, spaces, hyphens, and apostrophes'
    };
  }
  
  return {
    isValid: true,
    message: 'Valid name'
  };
};

/**
 * Sanitizes user input to prevent XSS attacks
 * Security: Removes potentially dangerous characters and scripts
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove javascript: protocols
    .replace(/javascript:/gi, '')
    // Remove on* event handlers
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Limit length to prevent buffer overflow
    .substring(0, 1000);
};

/**
 * Calculates password strength score (0-4)
 * Security: Provides visual feedback for password strength
 */
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  if (!password) {
    return { score: 0, label: 'No password', color: 'bg-gray-300' };
  }
  
  let score = 0;
  
  // Length bonus
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  
  // Character variety bonus
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
  
  // Reduce score for common patterns
  if (/(.)\1{2,}/.test(password)) score--; // Repeated characters
  if (/123|abc|qwe/i.test(password)) score--; // Sequential patterns
  
  // Normalize score to 0-4 range
  score = Math.max(0, Math.min(4, score));
  
  const strengthMap = {
    0: { label: 'Very Weak', color: 'bg-red-500' },
    1: { label: 'Weak', color: 'bg-red-400' },
    2: { label: 'Fair', color: 'bg-yellow-500' },
    3: { label: 'Good', color: 'bg-blue-500' },
    4: { label: 'Strong', color: 'bg-green-500' }
  };
  
  return {
    score,
    ...strengthMap[score as keyof typeof strengthMap]
  };
};
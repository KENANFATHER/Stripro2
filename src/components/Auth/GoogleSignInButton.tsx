/**
 * Google Sign-In Button Component
 * 
 * This component provides Google OAuth authentication using Supabase Auth.
 * It includes proper loading states, error handling, and responsive design.
 * 
 * Features:
 * - Google OAuth integration via Supabase
 * - Loading states and error handling
 * - Responsive design with Tailwind CSS
 * - Consistent styling with app theme
 * - Accessibility support
 * 
 * Usage:
 * - Used in authentication forms
 * - Handles OAuth flow automatically
 * - Redirects after successful authentication
 */

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useNotification } from '../../contexts/NotificationContext';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  className = '',
  disabled = false
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleGoogleSignIn = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        throw error;
      }

      // OAuth redirect will handle the rest
      // The callback will be processed by the auth callback handler
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign-in failed';
      
      setIsLoading(false);
      
      showNotification('error', 'Authentication Failed', errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={disabled || isLoading}
      className={`
        w-full flex items-center justify-center space-x-3 px-4 py-3
        bg-white border-2 border-sage-300 rounded-xl
        text-sage-700 font-semibold
        hover:bg-sage-50 hover:border-sage-400
        focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        shadow-sm hover:shadow-md
        ${className}
      `}
      aria-label="Sign in with Google"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-sage-600" />
          <span>Signing in...</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG */}
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;
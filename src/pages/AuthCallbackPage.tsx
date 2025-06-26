/**
 * Authentication Callback Page
 * 
 * This page handles OAuth callbacks from providers like Google.
 * It processes the authentication result and redirects users appropriately.
 * 
 * Features:
 * - OAuth callback processing
 * - Error handling for failed authentication
 * - Loading states during processing
 * - Automatic redirection after success
 * - User feedback for authentication status
 * 
 * Usage:
 * - Configured as OAuth redirect URL in Supabase
 * - Processes authentication tokens
 * - Redirects to dashboard or shows errors
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

const AuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL hash
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          // Authentication successful
          setStatus('success');
          
          showNotification(
            'success',
            'Welcome to Stripro!',
            'You have successfully signed in with Google.'
          );

          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard', { replace: true });
          }, 2000);
        } else {
          // No session found, might be an error
          throw new Error('No authentication session found');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        
        const message = error instanceof Error ? error.message : 'Authentication failed';
        setErrorMessage(message);
        setStatus('error');
        
        showNotification('error', 'Authentication Failed', message);

        // Redirect to login page after a delay
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, showNotification]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-coral-400 via-tangerine-400 to-lilac-400 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl border border-white/30 p-8 shadow-2xl max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin text-coral-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-sage-900 mb-4">
              Completing Sign In
            </h1>
            <p className="text-sage-600">
              Please wait while we complete your Google authentication...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-sage-900 mb-4">
              Welcome to Stripro!
            </h1>
            <p className="text-sage-600 mb-4">
              You have successfully signed in with Google.
            </p>
            <p className="text-sm text-sage-500">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-sage-900 mb-4">
              Authentication Failed
            </h1>
            <p className="text-sage-600 mb-4">
              {errorMessage || 'Something went wrong during sign in.'}
            </p>
            <p className="text-sm text-sage-500">
              Redirecting to sign in page...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallbackPage;
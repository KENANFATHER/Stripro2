/**
 * Supabase Client Configuration
 * 
 * This file sets up the Supabase client for authentication and database operations.
 * It includes proper configuration for OAuth providers and security settings.
 * 
 * Features:
 * - Supabase client initialization
 * - OAuth provider configuration
 * - Environment variable handling
 * - Type-safe client export
 * 
 * Usage:
 * - Import supabase client in services and components
 * - Use for authentication and database operations
 * - Configured for Google OAuth
 */

import { createClient } from '@supabase/supabase-js';

// Supabase configuration from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

// Create Supabase client with OAuth configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure OAuth settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // OAuth flow configuration
    flowType: 'pkce', // Use PKCE flow for better security
  },
});

// Export types for TypeScript support
export type { User, Session } from '@supabase/supabase-js';
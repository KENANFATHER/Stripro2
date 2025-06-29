/**
 * Authentication-related TypeScript interfaces and types
 * 
 * This file contains all type definitions related to user authentication,
 * including user data structures, authentication states, and form data types.
 * 
 * Usage:
 * - Import these types in authentication components and contexts
 * - Use for type safety in auth-related API calls and state management
 * - Extend these interfaces when adding new user properties
 */

export interface User {
  id: string;
  email: string;
  name: string;
  stripeConnected: boolean;
  stripeAccountId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<{
    success: boolean;
    requiresMFA?: boolean;
    mfaSessionId?: string;
  }>;
  signup: (credentials: SignupCredentials) => Promise<{
    success: boolean;
    requiresEmailVerification?: boolean;
  }>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}
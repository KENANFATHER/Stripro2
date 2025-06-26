/**
 * Authentication Service
 * 
 * This service handles all authentication-related API calls including
 * login, signup, logout, and token management. It's designed to work
 * with both mock data and future Supabase integration.
 * 
 * Features:
 * - User authentication (login/signup/logout)
 * - Token management and storage
 * - Password reset functionality
 * - Session validation
 * - User profile management
 * 
 * Usage:
 * - Import authService in components or contexts
 * - Call methods like authService.login(credentials)
 * - Handle responses and errors appropriately
 * 
 * Future enhancements:
 * - Replace mock calls with Supabase auth
 * - Add OAuth provider support
 * - Implement refresh token logic
 */

import { apiClient, handleApiError } from './apiUtils';
import { User, LoginCredentials, SignupCredentials } from '../types';

class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ user: User; token: string }> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: 'John Doe',
        stripeConnected: true
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Store token in API client
      apiClient.setAuthToken(mockToken);
      
      return {
        user: mockUser,
        token: mockToken
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new user account
   */
  async signup(credentials: SignupCredentials): Promise<{ user: User; token: string }> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post<{ user: User; token: string }>('/auth/signup', credentials);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUser: User = {
        id: '1',
        email: credentials.email,
        name: credentials.name,
        stripeConnected: false
      };

      const mockToken = 'mock-jwt-token-' + Date.now();

      // Store token in API client
      apiClient.setAuthToken(mockToken);
      
      return {
        user: mockUser,
        token: mockToken
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      // TODO: Replace with actual API call
      // await apiClient.post('/auth/logout');
      
      // Clear token from API client
      apiClient.clearAuthToken();
      
      // Clear token from localStorage
      localStorage.removeItem('auth_token');
    } catch (error) {
      // Even if logout fails on server, clear local data
      apiClient.clearAuthToken();
      localStorage.removeItem('auth_token');
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get<User>('/auth/me');
      
      // Mock implementation
      const mockUser: User = {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        stripeConnected: true
      };
      
      return mockUser;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.put<User>('/auth/profile', userData);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser: User = {
        id: '1',
        email: userData.email || 'john@example.com',
        name: userData.name || 'John Doe',
        stripeConnected: userData.stripeConnected || false
      };
      
      return updatedUser;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // TODO: Replace with actual API call
      // await apiClient.post('/auth/password-reset', { email });
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Validate authentication token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.post<{ valid: boolean }>('/auth/validate', { token });
      
      // Mock implementation
      return token.startsWith('mock-jwt-token-');
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
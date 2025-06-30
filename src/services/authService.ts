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
      const response = await apiClient.post<{ user: User; token: string }>('/auth/login', credentials);
      apiClient.setAuthToken(response.token);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Create new user account
   */
  async signup(credentials: SignupCredentials): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post<{ user: User; token: string }>('/auth/signup', credentials);
      apiClient.setAuthToken(response.token);
      return response;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Sign out current user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
      apiClient.clearAuthToken();
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
      const user = await apiClient.get<User>('/auth/me');
      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const updatedUser = await apiClient.put<User>('/auth/profile', userData);
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
      await apiClient.post('/auth/password-reset', { email });
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Validate authentication token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ valid: boolean }>('/auth/validate', { token });
      return response.valid;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
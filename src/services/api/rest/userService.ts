/**
 * User REST API Service
 * 
 * This service handles all user-related API operations using REST endpoints.
 * It provides methods for user management, authentication, and profile updates.
 * 
 * Features:
 * - User CRUD operations
 * - Authentication management
 * - Profile updates
 * - Preference management
 * - User search and filtering
 * 
 * Usage:
 * - Import userService in components
 * - Call methods like userService.getUsers()
 * - Handle responses and errors appropriately
 * 
 * How to swap dummy data with real API calls:
 * 1. Replace mock implementations with actual HTTP requests
 * 2. Update endpoint URLs to match your backend API
 * 3. Configure authentication headers and tokens
 * 4. Handle real error responses from your API
 * 5. Update response data mapping if needed
 */

import { BaseApiService } from '../base';
import {
  User,
  CreateUserPayload,
  UpdateUserPayload,
  QueryParams,
  ListResponse,
  ApiResponse
} from '../types';

/**
 * User Service Class
 * 
 * Extends BaseApiService to provide user-specific functionality.
 * All methods include detailed comments on how to replace mock data
 * with real API calls.
 */
class UserService extends BaseApiService {
  constructor() {
    super(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000');
  }

  /**
   * Get all users with optional filtering and pagination
   * 
   * @param params - Query parameters for filtering and pagination
   * @returns Promise with list of users
   */
  async getUsers(params: QueryParams = {}): Promise<ListResponse<User>> {
    try {
      const response = await this.get<ListResponse<User>>(`/users${this.buildQueryString(params)}`);
      return response;

    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get a single user by ID
   * 
   * @param id - User ID
   * @returns Promise with user data
   */
  async getUser(id: string): Promise<User> {
    try {
      const user = await this.get<User>(`/users/${id}`);
      return user;

    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * 
   * @param userData - User creation payload
   * @returns Promise with created user
   */
  async createUser(userData: CreateUserPayload): Promise<User> {
    try {
      const user = await this.post<User>('/users', userData);
      return user;

    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   * 
   * @param id - User ID
   * @param userData - User update payload
   * @returns Promise with updated user
   */
  async updateUser(id: string, userData: UpdateUserPayload): Promise<User> {
    try {
      const user = await this.put<User>(`/users/${id}`, userData);
      return user;

    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete a user
   * 
   * @param id - User ID
   * @returns Promise with success confirmation
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await this.delete(`/users/${id}`);

    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   * 
   * @returns Promise with current user data
   */
  async getCurrentUser(): Promise<User> {
    try {
      const user = await this.get<User>('/users/me');
      return user;

    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  /**
   * Update current user profile
   * 
   * @param userData - User update payload
   * @returns Promise with updated user
   */
  async updateCurrentUser(userData: UpdateUserPayload): Promise<User> {
    try {
      const user = await this.put<User>('/users/me', userData);
      return user;

    } catch (error) {
      console.error('Error updating current user:', error);
      throw error;
    }
  }

  /**
   * Change user password
   * 
   * @param currentPassword - Current password
   * @param newPassword - New password
   * @returns Promise with success confirmation
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.post('/users/me/password', { currentPassword, newPassword });

    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  /**
   * Connect Stripe account for user
   * 
   * @param stripeAccountId - Stripe account ID
   * @returns Promise with updated user
   */
  async connectStripeAccount(stripeAccountId: string): Promise<User> {
    try {
      const user = await this.post<User>('/users/me/stripe', { stripeAccountId });
      return user;

    } catch (error) {
      console.error('Error connecting Stripe account:', error);
      throw error;
    }
  }

  /**
   * Disconnect Stripe account for user
   * 
   * @returns Promise with updated user
   */
  async disconnectStripeAccount(): Promise<User> {
    try {
      const user = await this.delete<User>('/users/me/stripe');
      return user;

    } catch (error) {
      console.error('Error disconnecting Stripe account:', error);
      throw error;
    }
  }

  /**
   * Request full data deletion (GDPR compliance)
   * 
   * @param reason - Reason for data deletion request
   * @returns Promise with deletion request confirmation
   */
  async requestDataDeletion(reason?: string): Promise<{
    requestId: string;
    message: string;
    estimatedCompletionDate: string;
  }> {
    try {
      const result = await this.post<{
        requestId: string;
        message: string;
        estimatedCompletionDate: string;
      }>('/users/me/data-deletion', { reason });
      
      return result;

    } catch (error) {
      console.error('Error requesting data deletion:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();

/**
 * Example of how to use the UserService:
 * 
 * // Get all users with filtering
 * const users = await userService.getUsers({
 *   search: 'john',
 *   status: 'active',
 *   page: 1,
 *   limit: 10
 * });
 * 
 * // Get specific user
 * const user = await userService.getUser('user-id');
 * 
 * // Create new user
 * const newUser = await userService.createUser({
 *   email: 'new@example.com',
 *   name: 'New User',
 *   password: 'securepassword',
 *   role: 'user'
 * });
 * 
 * // Update user
 * const updatedUser = await userService.updateUser('user-id', {
 *   name: 'Updated Name',
 *   preferences: {
 *     theme: 'dark'
 *   }
 * });
 * 
 * // Delete user
 * await userService.deleteUser('user-id');
 */
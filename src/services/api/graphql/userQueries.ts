/**
 * User GraphQL Queries and Mutations
 * 
 * This file contains all GraphQL queries, mutations, and subscriptions
 * related to user management. It provides a centralized location for
 * all user-related GraphQL operations.
 * 
 * Features:
 * - User CRUD operations via GraphQL
 * - Real-time user updates via subscriptions
 * - Optimized queries with field selection
 * - Type-safe GraphQL operations
 * 
 * Usage:
 * - Import queries/mutations in components or services
 * - Use with GraphQL client for data fetching
 * - Customize field selection as needed
 * 
 * How to integrate with real GraphQL API:
 * 1. Update queries to match your GraphQL schema
 * 2. Add proper field selections and fragments
 * 3. Handle real GraphQL errors and validation
 * 4. Implement proper caching strategies
 */

import { graphqlClient } from './client';
import { User, CreateUserPayload, UpdateUserPayload, ListResponse } from '../types';

// ===== GRAPHQL FRAGMENTS =====

/**
 * User fragment for consistent field selection
 * This ensures we always fetch the same user fields across queries
 */
export const USER_FRAGMENT = `
  fragment UserFields on User {
    id
    email
    name
    avatar
    role
    status
    stripeConnected
    stripeAccountId
    preferences {
      theme
      language
      timezone
      notifications {
        email
        push
        sms
        weeklyReports
        monthlyDigest
        transactionAlerts
        lowProfitWarnings
      }
      dashboard {
        defaultView
        chartsEnabled
        autoRefresh
        refreshInterval
        favoriteMetrics
      }
    }
    createdAt
    updatedAt
    lastLoginAt
  }
`;

// ===== QUERIES =====

/**
 * Get all users with pagination and filtering
 */
export const GET_USERS = `
  ${USER_FRAGMENT}
  
  query GetUsers(
    $limit: Int
    $offset: Int
    $search: String
    $status: UserStatus
    $role: UserRole
    $sortBy: String
    $sortOrder: SortOrder
  ) {
    users(
      limit: $limit
      offset: $offset
      search: $search
      status: $status
      role: $role
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      items {
        ...UserFields
      }
      total
      hasMore
      nextCursor
    }
  }
`;

/**
 * Get a single user by ID
 */
export const GET_USER = `
  ${USER_FRAGMENT}
  
  query GetUser($id: ID!) {
    user(id: $id) {
      ...UserFields
    }
  }
`;

/**
 * Get current authenticated user
 */
export const GET_CURRENT_USER = `
  ${USER_FRAGMENT}
  
  query GetCurrentUser {
    me {
      ...UserFields
    }
  }
`;

/**
 * Search users with advanced filtering
 */
export const SEARCH_USERS = `
  ${USER_FRAGMENT}
  
  query SearchUsers(
    $query: String!
    $filters: UserSearchFilters
    $limit: Int
    $offset: Int
  ) {
    searchUsers(
      query: $query
      filters: $filters
      limit: $limit
      offset: $offset
    ) {
      items {
        ...UserFields
        score
        highlights {
          field
          matches
        }
      }
      total
      hasMore
    }
  }
`;

// ===== MUTATIONS =====

/**
 * Create a new user
 */
export const CREATE_USER = `
  ${USER_FRAGMENT}
  
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ...UserFields
    }
  }
`;

/**
 * Update an existing user
 */
export const UPDATE_USER = `
  ${USER_FRAGMENT}
  
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      ...UserFields
    }
  }
`;

/**
 * Update current user profile
 */
export const UPDATE_CURRENT_USER = `
  ${USER_FRAGMENT}
  
  mutation UpdateCurrentUser($input: UpdateUserInput!) {
    updateMe(input: $input) {
      ...UserFields
    }
  }
`;

/**
 * Delete a user
 */
export const DELETE_USER = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      success
      message
    }
  }
`;

/**
 * Change user password
 */
export const CHANGE_PASSWORD = `
  mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
    changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      message
    }
  }
`;

/**
 * Connect Stripe account
 */
export const CONNECT_STRIPE_ACCOUNT = `
  ${USER_FRAGMENT}
  
  mutation ConnectStripeAccount($stripeAccountId: String!) {
    connectStripeAccount(stripeAccountId: $stripeAccountId) {
      ...UserFields
    }
  }
`;

/**
 * Disconnect Stripe account
 */
export const DISCONNECT_STRIPE_ACCOUNT = `
  ${USER_FRAGMENT}
  
  mutation DisconnectStripeAccount {
    disconnectStripeAccount {
      ...UserFields
    }
  }
`;

/**
 * Bulk update users
 */
export const BULK_UPDATE_USERS = `
  mutation BulkUpdateUsers($updates: [BulkUserUpdate!]!) {
    bulkUpdateUsers(updates: $updates) {
      successful {
        id
        name
        email
        status
      }
      failed {
        id
        error
      }
      total
      successCount
      failureCount
    }
  }
`;

// ===== SUBSCRIPTIONS =====

/**
 * Subscribe to user updates
 */
export const USER_UPDATES = `
  ${USER_FRAGMENT}
  
  subscription UserUpdates($userId: ID) {
    userUpdates(userId: $userId) {
      type
      user {
        ...UserFields
      }
      timestamp
    }
  }
`;

/**
 * Subscribe to user activity
 */
export const USER_ACTIVITY = `
  subscription UserActivity {
    userActivity {
      userId
      action
      details
      timestamp
    }
  }
`;

// ===== SERVICE FUNCTIONS =====

/**
 * User GraphQL Service Class
 * 
 * This class provides methods for executing user-related GraphQL operations.
 * It wraps the GraphQL client and provides type-safe methods.
 */
export class UserGraphQLService {
  /**
   * Get all users with filtering and pagination
   * 
   * @param variables - Query variables
   * @returns Promise with users list
   * 
   * How to implement with real GraphQL API:
   * 1. Remove mock data and use actual GraphQL query
   * 2. Handle real GraphQL errors and validation
   * 3. Implement proper error handling
   * 4. Add loading states and optimistic updates
   */
  async getUsers(variables: {
    limit?: number;
    offset?: number;
    search?: string;
    status?: string;
    role?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<ListResponse<User>> {
    try {
      const result = await graphqlClient.query<{ users: ListResponse<User> }>(
        GET_USERS,
        { variables, cache: true }
      );
      
      return result.users;

    } catch (error) {
      console.error('Error fetching users via GraphQL:', error);
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
      const result = await graphqlClient.query<{ user: User }>(
        GET_USER,
        { variables: { id }, cache: true }
      );
      
      if (!result.user) {
        throw new Error('User not found');
      }
      
      return result.user;

    } catch (error) {
      console.error('Error fetching user via GraphQL:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   * 
   * @returns Promise with current user data
   */
  async getCurrentUser(): Promise<User> {
    try {
      const result = await graphqlClient.query<{ me: User }>(
        GET_CURRENT_USER,
        { cache: true }
      );
      
      if (!result.me) {
        throw new Error('User not authenticated');
      }
      
      return result.me;

    } catch (error) {
      console.error('Error fetching current user via GraphQL:', error);
      throw error;
    }
  }

  /**
   * Create a new user
   * 
   * @param userData - User creation data
   * @returns Promise with created user
   */
  async createUser(userData: CreateUserPayload): Promise<User> {
    try {
      const result = await graphqlClient.mutate<{ createUser: User }>(
        CREATE_USER,
        { variables: { input: userData } }
      );
      
      return result.createUser;

    } catch (error) {
      console.error('Error creating user via GraphQL:', error);
      throw error;
    }
  }

  /**
   * Update an existing user
   * 
   * @param id - User ID
   * @param userData - User update data
   * @returns Promise with updated user
   */
  async updateUser(id: string, userData: UpdateUserPayload): Promise<User> {
    try {
      const result = await graphqlClient.mutate<{ updateUser: User }>(
        UPDATE_USER,
        { variables: { id, input: userData } }
      );
      
      return result.updateUser;

    } catch (error) {
      console.error('Error updating user via GraphQL:', error);
      throw error;
    }
  }

  /**
   * Update current user profile
   * 
   * @param userData - User update data
   * @returns Promise with updated user
   */
  async updateCurrentUser(userData: UpdateUserPayload): Promise<User> {
    try {
      const result = await graphqlClient.mutate<{ updateMe: User }>(
        UPDATE_CURRENT_USER,
        { variables: { input: userData } }
      );
      
      return result.updateMe;

    } catch (error) {
      console.error('Error updating current user via GraphQL:', error);
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
      const result = await graphqlClient.mutate<{ deleteUser: { success: boolean; message: string } }>(
        DELETE_USER,
        { variables: { id } }
      );
      
      if (!result.deleteUser.success) {
        throw new Error(result.deleteUser.message);
      }

    } catch (error) {
      console.error('Error deleting user via GraphQL:', error);
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
      const result = await graphqlClient.mutate<{ changePassword: { success: boolean; message: string } }>(
        CHANGE_PASSWORD,
        { variables: { currentPassword, newPassword } }
      );
      
      if (!result.changePassword.success) {
        throw new Error(result.changePassword.message);
      }

    } catch (error) {
      console.error('Error changing password via GraphQL:', error);
      throw error;
    }
  }

  /**
   * Connect Stripe account
   * 
   * @param stripeAccountId - Stripe account ID
   * @returns Promise with updated user
   */
  async connectStripeAccount(stripeAccountId: string): Promise<User> {
    try {
      const result = await graphqlClient.mutate<{ connectStripeAccount: User }>(
        CONNECT_STRIPE_ACCOUNT,
        { variables: { stripeAccountId } }
      );
      
      return result.connectStripeAccount;

    } catch (error) {
      console.error('Error connecting Stripe account via GraphQL:', error);
      throw error;
    }
  }

  /**
   * Disconnect Stripe account
   * 
   * @returns Promise with updated user
   */
  async disconnectStripeAccount(): Promise<User> {
    try {
      const result = await graphqlClient.mutate<{ disconnectStripeAccount: User }>(
        DISCONNECT_STRIPE_ACCOUNT
      );
      
      return result.disconnectStripeAccount;

    } catch (error) {
      console.error('Error disconnecting Stripe account via GraphQL:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user updates
   * 
   * @param userId - Optional user ID to filter updates
   * @param onUpdate - Callback for user updates
   * @returns Subscription ID for cleanup
   */
  subscribeToUserUpdates(
    userId?: string,
    onUpdate?: (data: { type: string; user: User; timestamp: string }) => void
  ): string {
    return graphqlClient.subscribe(USER_UPDATES, {
      variables: { userId },
      onData: (data) => {
        if (data.userUpdates && onUpdate) {
          onUpdate(data.userUpdates);
        }
      },
      onError: (error) => {
        console.error('User updates subscription error:', error);
      }
    });
  }

  /**
   * Unsubscribe from user updates
   * 
   * @param subscriptionId - Subscription ID to cancel
   */
  unsubscribeFromUserUpdates(subscriptionId: string): void {
    graphqlClient.unsubscribe(subscriptionId);
  }
}

// Export singleton instance
export const userGraphQLService = new UserGraphQLService();

/**
 * Example of how to use the UserGraphQLService:
 * 
 * // Get all users
 * const users = await userGraphQLService.getUsers({
 *   limit: 10,
 *   search: 'john',
 *   status: 'active'
 * });
 * 
 * // Get specific user
 * const user = await userGraphQLService.getUser('user-id');
 * 
 * // Create new user
 * const newUser = await userGraphQLService.createUser({
 *   name: 'New User',
 *   email: 'new@example.com',
 *   password: 'securepassword',
 *   role: 'user'
 * });
 * 
 * // Subscribe to user updates
 * const subscriptionId = userGraphQLService.subscribeToUserUpdates(
 *   'user-id',
 *   (update) => {
 *     console.log('User updated:', update);
 *   }
 * );
 * 
 * // Cleanup subscription
 * userGraphQLService.unsubscribeFromUserUpdates(subscriptionId);
 */
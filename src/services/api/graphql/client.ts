/**
 * GraphQL Client Configuration
 * 
 * This file sets up the GraphQL client for making GraphQL queries and mutations.
 * It provides a foundation for GraphQL API integration with features like
 * caching, error handling, and subscription support.
 * 
 * Features:
 * - GraphQL query and mutation execution
 * - Real-time subscriptions
 * - Caching and performance optimization
 * - Error handling and retry logic
 * - Authentication integration
 * 
 * Usage:
 * - Import graphqlClient in GraphQL services
 * - Use for executing queries, mutations, and subscriptions
 * - Configure caching and error policies as needed
 * 
 * How to integrate with real GraphQL API:
 * 1. Replace mock endpoint with your GraphQL server URL
 * 2. Configure authentication headers
 * 3. Set up subscription transport (WebSocket)
 * 4. Configure caching policies
 * 5. Handle real error responses
 */

import {
  GraphQLResponse,
  GraphQLVariables,
  GraphQLSubscription
} from '../types';

/**
 * GraphQL Query Configuration
 */
interface QueryConfig {
  variables?: GraphQLVariables;
  headers?: Record<string, string>;
  cache?: boolean;
  timeout?: number;
}

/**
 * GraphQL Subscription Configuration
 */
interface SubscriptionConfig {
  variables?: GraphQLVariables;
  headers?: Record<string, string>;
  onData?: (data: any) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

/**
 * GraphQL Client Class
 * 
 * This class provides a comprehensive GraphQL client with support for
 * queries, mutations, subscriptions, and advanced features like caching.
 */
export class GraphQLClient {
  private endpoint: string;
  private defaultHeaders: Record<string, string>;
  private cache = new Map<string, { data: any; expires: number }>();
  private subscriptions = new Map<string, WebSocket>();

  constructor(endpoint: string, defaultHeaders: Record<string, string> = {}) {
    this.endpoint = endpoint;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...defaultHeaders
    };
  }

  /**
   * Set authentication token for all requests
   * 
   * @param token - JWT or API token
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Execute GraphQL query
   * 
   * @param query - GraphQL query string
   * @param config - Query configuration
   * @returns Promise with query result
   * 
   * How to implement with real GraphQL API:
   * 1. Replace mock implementation with actual HTTP request
   * 2. Use fetch() or GraphQL client library like Apollo
   * 3. Handle real GraphQL errors and validation
   * 4. Implement proper caching strategy
   */
  async query<T>(query: string, config: QueryConfig = {}): Promise<T> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { ...this.defaultHeaders, ...config.headers },
        body: JSON.stringify({ query, variables: config.variables })
      });
      const result: GraphQLResponse<T> = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      if (config.cache) {
        const cacheKey = this.getCacheKey(query, config.variables);
        const cached = this.getFromCache(cacheKey);
        if (cached) {
          return cached;
        }
      }

      // Cache the result if caching is enabled
      if (config.cache) {
        const cacheKey = this.getCacheKey(query, config.variables);
        this.setCache(cacheKey, result.data);
      }

      return result.data!;

    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  }

  /**
   * Execute GraphQL mutation
   * 
   * @param mutation - GraphQL mutation string
   * @param config - Mutation configuration
   * @returns Promise with mutation result
   * 
   * How to implement with real GraphQL API:
   * 1. Replace mock implementation with actual HTTP request
   * 2. Handle mutation-specific error handling
   * 3. Invalidate relevant cache entries
   * 4. Handle optimistic updates if needed
   */
  async mutate<T>(mutation: string, config: QueryConfig = {}): Promise<T> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { ...this.defaultHeaders, ...config.headers },
        body: JSON.stringify({ query: mutation, variables: config.variables })
      });
      const result: GraphQLResponse<T> = await response.json();
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      // Clear relevant cache entries after mutation
      this.invalidateCache(mutation);

      return result.data!;

    } catch (error) {
      console.error('GraphQL mutation error:', error);
      throw error;
    }
  }

  /**
   * Subscribe to GraphQL subscription
   * 
   * @param subscription - GraphQL subscription string
   * @param config - Subscription configuration
   * @returns Subscription ID for cleanup
   * 
   * How to implement with real GraphQL API:
   * 1. Replace mock implementation with WebSocket connection
   * 2. Use GraphQL subscription transport (graphql-ws)
   * 3. Handle connection lifecycle events
   * 4. Implement reconnection logic
   */
  subscribe(subscription: string, config: SubscriptionConfig = {}): string {
    const wsUrl = this.endpoint.replace('http', 'ws');
    const ws = new WebSocket(wsUrl, 'graphql-ws');
    const subscriptionId = Math.random().toString(36).substr(2, 9);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'start',
        payload: { query: subscription, variables: config.variables }
      }));
    };
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'data') {
        config.onData?.(message.payload);
      }
    };
    
    ws.onerror = (error) => {
      config.onError?.(new Error(`WebSocket error: ${error}`));
    };
    
    ws.onclose = () => {
      config.onComplete?.();
    };
    
    this.subscriptions.set(subscriptionId, ws);
    
    return subscriptionId;
  }

  /**
   * Unsubscribe from GraphQL subscription
   * 
   * @param subscriptionId - Subscription ID to cancel
   */
  unsubscribe(subscriptionId: string): void {
    const ws = this.subscriptions.get(subscriptionId);
    if (ws) {
      ws.close();
      this.subscriptions.delete(subscriptionId);
    }
  }

  /**
   * Generate cache key for query
   * 
   * @param query - GraphQL query
   * @param variables - Query variables
   * @returns Cache key string
   */
  private getCacheKey(query: string, variables?: GraphQLVariables): string {
    const variablesStr = variables ? JSON.stringify(variables) : '';
    return `${query}:${variablesStr}`;
  }

  /**
   * Get data from cache
   * 
   * @param key - Cache key
   * @returns Cached data or null
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache
   * 
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in seconds
   */
  private setCache<T>(key: string, data: T, ttl: number = 300): void {
    const expires = Date.now() + (ttl * 1000);
    this.cache.set(key, { data, expires });
  }

  /**
   * Invalidate cache entries based on mutation
   * 
   * @param mutation - GraphQL mutation
   */
  private invalidateCache(mutation: string): void {
    // Simple cache invalidation based on mutation type
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (mutation.includes('User') && key.includes('users')) {
        keysToDelete.push(key);
      } else if (mutation.includes('Client') && key.includes('clients')) {
        keysToDelete.push(key);
      } else if (mutation.includes('Transaction') && key.includes('transactions')) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Close all active subscriptions
   */
  closeAllSubscriptions(): void {
    for (const [id, ws] of this.subscriptions.entries()) {
      ws.close();
    }
    this.subscriptions.clear();
  }
}

/**
 * Create a configured GraphQL client instance
 * 
 * @param endpoint - GraphQL endpoint URL
 * @param defaultHeaders - Default headers for all requests
 * @returns Configured GraphQLClient instance
 */
export function createGraphQLClient(
  endpoint: string,
  defaultHeaders: Record<string, string> = {}
): GraphQLClient {
  return new GraphQLClient(endpoint, defaultHeaders);
}

// Default GraphQL client instance
// TODO: Replace with your actual GraphQL endpoint
export const graphqlClient = createGraphQLClient(
  import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql'
);

/**
 * Example GraphQL queries and mutations:
 * 
 * // Query example
 * const GET_USERS = `
 *   query GetUsers($limit: Int, $offset: Int) {
 *     users(limit: $limit, offset: $offset) {
 *       id
 *       name
 *       email
 *       role
 *       createdAt
 *     }
 *   }
 * `;
 * 
 * // Mutation example
 * const CREATE_USER = `
 *   mutation CreateUser($input: CreateUserInput!) {
 *     createUser(input: $input) {
 *       id
 *       name
 *       email
 *       role
 *       createdAt
 *     }
 *   }
 * `;
 * 
 * // Subscription example
 * const TRANSACTION_UPDATES = `
 *   subscription TransactionUpdates {
 *     transactionUpdates {
 *       id
 *       status
 *       amount
 *       clientId
 *       timestamp
 *     }
 *   }
 * `;
 */
/**
 * API Services Export File
 * 
 * This file serves as the central export point for all API services,
 * providing a clean import interface for both REST and GraphQL services.
 * 
 * Usage:
 * - Import services: import { userService, clientService, graphqlClient } from '@/services/api'
 * - Choose between REST and GraphQL services based on your needs
 * - Use the base service classes to create custom services
 * 
 * Architecture:
 * - REST services for traditional HTTP API integration
 * - GraphQL services for modern GraphQL API integration
 * - Base classes for extending with custom functionality
 * - Type definitions for consistent data structures
 */

// ===== BASE SERVICES =====
export { BaseApiService, createApiService, DEFAULT_API_CONFIG } from './base';

// ===== TYPE DEFINITIONS =====
export type * from './types';

// ===== REST SERVICES =====
export { userService } from './rest/userService';
export { clientService } from './rest/clientService';
export { transactionService } from './rest/transactionService';

// ===== GRAPHQL SERVICES =====
export { GraphQLClient, createGraphQLClient, graphqlClient } from './graphql/client';
export { userGraphQLService } from './graphql/userQueries';

// ===== MCP SERVICES =====

// ===== SERVICE FACTORY =====

/**
 * Service Factory for creating configured service instances
 * 
 * This factory allows you to create service instances with custom
 * configuration for different environments or API endpoints.
 */
export class ServiceFactory {
  private static restServices = new Map<string, any>();
  private static graphqlClients = new Map<string, any>();

  /**
   * Create or get a REST service instance
   * 
   * @param serviceName - Name of the service
   * @param baseURL - Base URL for the service
   * @param headers - Default headers
   * @returns Service instance
   */
  static getRestService<T>(
    serviceName: string,
    ServiceClass: new (baseURL: string) => T,
    baseURL?: string,
    headers?: Record<string, string>
  ): T {
    const key = `${serviceName}-${baseURL}`;
    
    if (!this.restServices.has(key)) {
      const service = new ServiceClass(
        baseURL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1'
      );
      
      // Set default headers if provided
      if (headers && 'setAuthToken' in service) {
        Object.entries(headers).forEach(([key, value]) => {
          if (key === 'Authorization' && value.startsWith('Bearer ')) {
            (service as any).setAuthToken(value.replace('Bearer ', ''));
          }
        });
      }
      
      this.restServices.set(key, service);
    }
    
    return this.restServices.get(key);
  }

  /**
   * Create or get a GraphQL client instance
   * 
   * @param clientName - Name of the client
   * @param endpoint - GraphQL endpoint
   * @param headers - Default headers
   * @returns GraphQL client instance
   */
  static getGraphQLClient(
    clientName: string,
    endpoint?: string,
    headers?: Record<string, string>
  ): GraphQLClient {
    const key = `${clientName}-${endpoint}`;
    
    if (!this.graphqlClients.has(key)) {
      const client = createGraphQLClient(
        endpoint || import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
        headers
      );
      
      this.graphqlClients.set(key, client);
    }
    
    return this.graphqlClients.get(key);
  }

  /**
   * Clear all cached service instances
   */
  static clearCache(): void {
    this.restServices.clear();
    this.graphqlClients.clear();
  }

  /**
   * Set authentication token for all services
   * 
   * @param token - Authentication token
   */
  static setAuthToken(token: string): void {
    // Set token for REST services
    this.restServices.forEach(service => {
      if ('setAuthToken' in service) {
        service.setAuthToken(token);
      }
    });

    // Set token for GraphQL clients
    this.graphqlClients.forEach(client => {
      if ('setAuthToken' in client) {
        client.setAuthToken(token);
      }
    });
  }

  /**
   * Clear authentication token from all services
   */
  static clearAuthToken(): void {
    // Clear token from REST services
    this.restServices.forEach(service => {
      if ('clearAuthToken' in service) {
        service.clearAuthToken();
      }
    });

    // Clear token from GraphQL clients
    this.graphqlClients.forEach(client => {
      if ('clearAuthToken' in client) {
        client.clearAuthToken();
      }
    });
  }
}

// ===== UTILITY FUNCTIONS =====

/**
 * Configure all services with authentication token
 * 
 * @param token - Authentication token
 */
export function configureServices(token: string): void {
  ServiceFactory.setAuthToken(token);
}

/**
 * Clear authentication from all services
 */
export function clearServiceAuth(): void {
  ServiceFactory.clearAuthToken();
}

/**
 * Health check for all services
 * 
 * @returns Promise with health status
 */
export async function checkServiceHealth(): Promise<{
  rest: boolean;
  graphql: boolean;
  errors: string[];
}> {
  const errors: string[] = [];
  let restHealthy = false;
  let graphqlHealthy = false;

  try {
    // Check REST API health
    // TODO: Implement actual health check endpoint
    // await userService.getCurrentUser();
    restHealthy = true;
  } catch (error) {
    errors.push(`REST API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  try {
    // Check GraphQL API health
    // TODO: Implement actual health check query
    // await userGraphQLService.getCurrentUser();
    graphqlHealthy = true;
  } catch (error) {
    errors.push(`GraphQL API: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    rest: restHealthy,
    graphql: graphqlHealthy,
    errors
  };
}

/**
 * Default service configuration
 */
export const DEFAULT_SERVICE_CONFIG = {
  rest: {
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    timeout: 30000,
    retries: 3
  },
  graphql: {
    endpoint: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
    subscriptionEndpoint: import.meta.env.VITE_GRAPHQL_WS_URL || 'ws://localhost:4000/graphql'
  }
};

/**
 * Example of how to use the service layer:
 * 
 * // Using REST services
 * import { userService, clientService, transactionService } from '@/services/api';
 * 
 * const users = await userService.getUsers({ page: 1, limit: 10 });
 * const clients = await clientService.getClients({ status: 'active' });
 * const transactions = await transactionService.getTransactions({ clientId: 'client-123' });
 * 
 * // Using GraphQL services
 * import { userGraphQLService, graphqlClient } from '@/services/api';
 * 
 * const users = await userGraphQLService.getUsers({ limit: 10 });
 * const subscriptionId = userGraphQLService.subscribeToUserUpdates();
 * 
 * // Using service factory for custom configurations
 * import { ServiceFactory } from '@/services/api';
 * 
 * const customUserService = ServiceFactory.getRestService(
 *   'users',
 *   UserService,
 *   'https://api.custom.com/v1'
 * );
 * 
 * // Configure authentication for all services
 * import { configureServices } from '@/services/api';
 * 
 * configureServices('your-auth-token');
 */
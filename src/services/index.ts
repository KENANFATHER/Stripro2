/**
 * Services Export File
 * 
 * This file serves as the central export point for all service modules
 * used throughout the application. It provides a clean import interface
 * for components that need multiple services.
 * 
 * Updated to include the new API service layer with both REST and GraphQL support.
 * 
 * Usage:
 * - Import services from this file: import { authService, userService } from '@/services'
 * - Add new service exports here when creating new service modules
 * - Keep this file organized by grouping related exports
 */

// ===== LEGACY SERVICES =====
// These are the existing services that may be gradually replaced by the new API layer
export { apiClient, handleApiError } from './apiUtils';
export { authService } from './authService';
export { clientService as legacyClientService } from './clientService';
export { supabaseAuthService } from './supabaseAuthService';
export { sessionManager } from './sessionManager';
export { securityService } from './securityService';
export { stripeService, stripePromise } from './stripe';

// ===== NEW API SERVICE LAYER =====
// Modern API service layer with REST and GraphQL support
export * from './api';

// Explicitly export the main services to ensure they're available
export { userService, clientService, transactionService } from './api';

// ===== SERVICE CONFIGURATION =====

/**
 * Service configuration and initialization
 * 
 * This function sets up all services with the appropriate configuration
 * based on the environment and user authentication state.
 */
export function initializeServices(): void {
  // Initialize legacy services
  console.log('[Services] Initializing legacy services...');
  
  // Initialize new API services
  console.log('[Services] Initializing API service layer...');
  
  // Set up service health monitoring
  setupServiceHealthMonitoring();
}

/**
 * Set up service health monitoring
 * 
 * This function sets up periodic health checks for all services
 * to ensure they are functioning properly.
 */
function setupServiceHealthMonitoring(): void {
  // Check service health every 5 minutes
  setInterval(async () => {
    try {
      const { checkServiceHealth } = await import('./api');
      const health = await checkServiceHealth();
      
      if (health.errors.length > 0) {
        console.warn('[Services] Health check failed:', health.errors);
      } else {
        console.log('[Services] All services healthy');
      }
    } catch (error) {
      console.error('[Services] Health check error:', error);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Configure services with authentication
 * 
 * @param token - Authentication token
 */
export async function configureServicesAuth(token: string): Promise<void> {
  try {
    // Configure legacy services
    const { apiClient } = await import('./apiUtils');
    apiClient.setAuthToken(token);
    
    // Configure new API services
    const { configureServices } = await import('./api');
    configureServices(token);
    
    console.log('[Services] Authentication configured for all services');
  } catch (error) {
    console.error('[Services] Failed to configure authentication:', error);
  }
}

/**
 * Clear authentication from all services
 */
export async function clearServicesAuth(): Promise<void> {
  try {
    // Clear legacy services
    const { apiClient } = await import('./apiUtils');
    apiClient.clearAuthToken();
    
    // Clear new API services
    const { clearServiceAuth } = await import('./api');
    clearServiceAuth();
    
    console.log('[Services] Authentication cleared from all services');
  } catch (error) {
    console.error('[Services] Failed to clear authentication:', error);
  }
}

/**
 * Service migration utilities
 * 
 * These utilities help migrate from legacy services to the new API layer
 */
export const ServiceMigration = {
  /**
   * Check if new API services are available
   */
  isNewApiAvailable(): boolean {
    return !!(process.env.REACT_APP_API_URL || process.env.REACT_APP_GRAPHQL_URL);
  },

  /**
   * Get the appropriate service based on availability
   * 
   * @param serviceName - Name of the service
   * @returns Service instance
   */
  async getService(serviceName: 'user' | 'client' | 'transaction') {
    if (this.isNewApiAvailable()) {
      // Use new API services
      const { userService, clientService, transactionService } = await import('./api');
      
      switch (serviceName) {
        case 'user':
          return userService;
        case 'client':
          return clientService;
        case 'transaction':
          return transactionService;
        default:
          throw new Error(`Unknown service: ${serviceName}`);
      }
    } else {
      // Fall back to legacy services
      const { authService, clientService } = await import('./clientService');
      
      switch (serviceName) {
        case 'user':
          return authService; // Legacy auth service handles users
        case 'client':
          return clientService;
        default:
          throw new Error(`Legacy service not available: ${serviceName}`);
      }
    }
  },

  /**
   * Migrate data from legacy to new API format
   * 
   * @param data - Legacy data
   * @param type - Data type
   * @returns Migrated data
   */
  migrateData(data: any, type: 'user' | 'client' | 'transaction'): any {
    // This would contain logic to transform legacy data structures
    // to match the new API interfaces
    
    switch (type) {
      case 'user':
        return {
          ...data,
          // Add any new fields or transform existing ones
          preferences: data.preferences || {
            theme: 'light',
            language: 'en',
            timezone: 'America/New_York',
            notifications: {},
            dashboard: {}
          }
        };
      
      case 'client':
        return {
          ...data,
          // Ensure all required fields are present
          profitMargin: data.profitMargin || (data.netProfit / data.totalRevenue) * 100,
          averageTransactionValue: data.averageTransactionValue || (data.totalRevenue / data.transactionCount)
        };
      
      case 'transaction':
        return {
          ...data,
          // Add new transaction fields
          processingStatus: data.processingStatus || 'settled',
          riskScore: data.riskScore || 0,
          fraudFlags: data.fraudFlags || []
        };
      
      default:
        return data;
    }
  }
};

/**
 * Example of how to use the service layer:
 * 
 * // Initialize services on app startup
 * import { initializeServices, configureServicesAuth } from '@/services';
 * 
 * initializeServices();
 * 
 * // Configure authentication when user logs in
 * await configureServicesAuth(userToken);
 * 
 * // Use services in components
 * import { userService, clientService } from '@/services';
 * 
 * const users = await userService.getUsers();
 * const clients = await clientService.getClients();
 * 
 * // Use service migration for gradual migration
 * import { ServiceMigration } from '@/services';
 * 
 * const userService = await ServiceMigration.getService('user');
 * const users = await userService.getUsers();
 */
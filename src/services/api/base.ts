/**
 * Base API Service
 * 
 * This file provides the foundation for all API services with common
 * functionality like authentication, error handling, caching, and
 * request/response interceptors.
 * 
 * Features:
 * - HTTP client configuration
 * - Authentication token management
 * - Request/response interceptors
 * - Error handling and retry logic
 * - Caching mechanisms
 * - Rate limiting
 * - Request cancellation
 * 
 * Usage:
 * - Extend this class for specific API services
 * - Configure base URL and default headers
 * - Implement service-specific methods
 */

import { ApiResponse, ApiError, CacheConfig, RateLimitConfig } from './types';

/**
 * HTTP methods supported by the API client
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request configuration options
 */
interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: CacheConfig;
  rateLimit?: RateLimitConfig;
  signal?: AbortSignal;
}

/**
 * Request interceptor function type
 */
type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function type
 */
type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;

/**
 * Error interceptor function type
 */
type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

/**
 * Base API Service Class
 * 
 * This class provides common functionality for all API services.
 * It handles authentication, caching, error handling, and more.
 */
export class BaseApiService {
  protected baseURL: string;
  protected defaultHeaders: Record<string, string>;
  protected authToken: string | null = null;
  
  // Interceptors
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  
  // Cache and rate limiting
  private cache = new Map<string, { data: any; expires: number }>();
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...defaultHeaders
    };

    // Set up default interceptors
    this.setupDefaultInterceptors();
  }

  /**
   * Set authentication token for all requests
   * 
   * @param token - JWT or API token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Add request interceptor
   * 
   * @param interceptor - Function to modify request config
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   * 
   * @param interceptor - Function to modify response data
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * Add error interceptor
   * 
   * @param interceptor - Function to handle errors
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Make HTTP GET request
   * 
   * @param endpoint - API endpoint
   * @param config - Request configuration
   * @returns Promise with response data
   */
  protected async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  /**
   * Make HTTP POST request
   * 
   * @param endpoint - API endpoint
   * @param data - Request payload
   * @param config - Request configuration
   * @returns Promise with response data
   */
  protected async post<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>('POST', endpoint, data, config);
  }

  /**
   * Make HTTP PUT request
   * 
   * @param endpoint - API endpoint
   * @param data - Request payload
   * @param config - Request configuration
   * @returns Promise with response data
   */
  protected async put<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  /**
   * Make HTTP PATCH request
   * 
   * @param endpoint - API endpoint
   * @param data - Request payload
   * @param config - Request configuration
   * @returns Promise with response data
   */
  protected async patch<T>(endpoint: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  /**
   * Make HTTP DELETE request
   * 
   * @param endpoint - API endpoint
   * @param config - Request configuration
   * @returns Promise with response data
   */
  protected async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  /**
   * Generic HTTP request method
   * 
   * This is the core method that handles all HTTP requests with
   * interceptors, caching, rate limiting, and error handling.
   * 
   * @param method - HTTP method
   * @param endpoint - API endpoint
   * @param data - Request payload
   * @param config - Request configuration
   * @returns Promise with response data
   */
  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    // Apply request interceptors
    let finalConfig = config;
    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    // Check cache for GET requests
    if (method === 'GET' && finalConfig.cache) {
      const cachedData = this.getFromCache(endpoint);
      if (cachedData) {
        return cachedData;
      }
    }

    // Check rate limiting
    if (finalConfig.rateLimit) {
      this.checkRateLimit(endpoint, finalConfig.rateLimit);
    }

    // Build request URL and headers
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      ...this.defaultHeaders,
      ...finalConfig.headers
    };

    // Create request configuration
    const requestInit: RequestInit = {
      method,
      headers,
      signal: finalConfig.signal
    };

    // Add body for non-GET requests
    if (data && method !== 'GET') {
      requestInit.body = JSON.stringify(data);
    }

    try {
      // Make the actual HTTP request
      const response = await this.fetchWithRetry(url, requestInit, finalConfig.retries || 0);
      
      if (!response.ok) {
        throw await this.handleHttpError(response);
      }

      // Parse response
      const responseData: ApiResponse<T> = await response.json();

      // Apply response interceptors
      let finalResponse = responseData;
      for (const interceptor of this.responseInterceptors) {
        finalResponse = await interceptor(finalResponse);
      }

      // Cache successful GET responses
      if (method === 'GET' && finalConfig.cache) {
        this.setCache(endpoint, finalResponse.data, finalConfig.cache);
      }

      return finalResponse.data;

    } catch (error) {
      // Apply error interceptors
      let finalError = error as ApiError;
      for (const interceptor of this.errorInterceptors) {
        finalError = await interceptor(finalError);
      }

      throw finalError;
    }
  }

  /**
   * Fetch with retry logic
   * 
   * @param url - Request URL
   * @param init - Request configuration
   * @param retries - Number of retries
   * @returns Promise with response
   */
  private async fetchWithRetry(
    url: string,
    init: RequestInit,
    retries: number
  ): Promise<Response> {
    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, init);
        
        // Don't retry on client errors (4xx), only server errors (5xx)
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on the last attempt
        if (attempt === retries) {
          break;
        }

        // Exponential backoff delay
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Handle HTTP errors and convert to ApiError format
   * 
   * @param response - HTTP response
   * @returns Promise with ApiError
   */
  private async handleHttpError(response: Response): Promise<ApiError> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    return {
      code: response.status.toString(),
      message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      details: errorData.details,
      timestamp: new Date().toISOString(),
      path: response.url
    };
  }

  /**
   * Check rate limiting for requests
   * 
   * @param key - Rate limit key (usually endpoint)
   * @param config - Rate limit configuration
   */
  private checkRateLimit(key: string, config: RateLimitConfig): void {
    const now = Date.now();
    const entry = this.rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      });
      return;
    }

    if (entry.count >= config.maxRequests) {
      throw new Error(`Rate limit exceeded for ${key}. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`);
    }

    entry.count++;
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
   * @param config - Cache configuration
   */
  private setCache<T>(key: string, data: T, config: CacheConfig): void {
    const expires = Date.now() + (config.ttl * 1000);
    this.cache.set(key, { data, expires });

    // Clean up expired entries periodically
    if (this.cache.size > 100) {
      this.cleanupCache();
    }
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Set up default interceptors for common functionality
   */
  private setupDefaultInterceptors(): void {
    // Request interceptor for logging
    this.addRequestInterceptor((config) => {
      console.log(`[API] Request: ${JSON.stringify(config)}`);
      return config;
    });

    // Response interceptor for logging
    this.addResponseInterceptor((response) => {
      console.log(`[API] Response: ${JSON.stringify(response)}`);
      return response;
    });

    // Error interceptor for logging
    this.addErrorInterceptor((error) => {
      console.error(`[API] Error: ${JSON.stringify(error)}`);
      return error;
    });
  }

  /**
   * Create an AbortController for request cancellation
   * 
   * @returns AbortController instance
   */
  createAbortController(): AbortController {
    return new AbortController();
  }

  /**
   * Build query string from parameters
   * 
   * @param params - Query parameters
   * @returns Query string
   */
  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    }

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * 
   * @returns Cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    // This is a simplified implementation
    // In a real application, you'd track hits and misses
    return {
      size: this.cache.size,
      hitRate: 0 // Would need to implement hit/miss tracking
    };
  }
}

/**
 * Create a configured API service instance
 * 
 * @param baseURL - Base URL for the API
 * @param defaultHeaders - Default headers for all requests
 * @returns Configured BaseApiService instance
 */
export function createApiService(
  baseURL: string,
  defaultHeaders: Record<string, string> = {}
): BaseApiService {
  return new BaseApiService(baseURL, defaultHeaders);
}

/**
 * Default API configuration
 */
export const DEFAULT_API_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  cache: {
    ttl: 300, // 5 minutes
    key: '',
    tags: [],
    invalidateOn: []
  },
  rateLimit: {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  }
};
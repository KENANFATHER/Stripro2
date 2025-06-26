/**
 * API Service Configuration
 * 
 * This file contains the base API configuration and common utilities
 * for making HTTP requests. It provides a centralized place to configure
 * API endpoints, authentication headers, and request/response interceptors.
 * 
 * Features:
 * - Base URL configuration
 * - Authentication token handling
 * - Request/response interceptors
 * - Error handling utilities
 * - TypeScript support for API responses
 * 
 * Usage:
 * - Import apiClient for making HTTP requests
 * - Use handleApiError for consistent error handling
 * - Configure base URL and headers as needed
 * 
 * Future enhancements:
 * - Add request retry logic
 * - Implement request caching
 * - Add request/response logging
 */

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// API response wrapper interface
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// API error interface
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Simple fetch wrapper with authentication and error handling
 */
class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set authentication token for all requests
   */
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authentication token
   */
  clearAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Make a GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  /**
   * Make a POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  /**
   * Make a PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  /**
   * Generic request method
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      method,
      headers: this.defaultHeaders,
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle and format API errors
   */
  private handleError(error: any): ApiError {
    if (error instanceof Error) {
      return {
        message: error.message,
        status: 500
      };
    }

    return {
      message: 'An unexpected error occurred',
      status: 500
    };
  }
}

// Export configured API client instance
export const apiClient = new ApiClient(API_BASE_URL);

/**
 * Utility function to handle API errors consistently
 */
export const handleApiError = (error: any): string => {
  if (error?.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};
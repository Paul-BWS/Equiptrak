/**
 * API Client Utility
 * 
 * This utility provides a consistent way to interact with the API
 * and handles common error scenarios like token expiration.
 */

import { toast } from 'react-hot-toast';

// API Configuration
const API_CONFIG = {
  // Base URL for API requests
  BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://your-production-domain.com'
    : '',  // Changed to use relative URLs
  // Default timeout in milliseconds
  TIMEOUT: 30000,
  // Whether to log API requests and responses
  DEBUG: true
};

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  ok: boolean;
  headers?: Headers;
}

// Interface for ApiClient options
interface ApiClientOptions extends RequestInit {
  timeout?: number;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuthHeader?: boolean;
}

/**
 * ApiClient class provides methods for making API requests
 */
class ApiClient {
  /**
   * Make an API request
   */
  static async request<T = any>(
    endpoint: string,
    options: ApiClientOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = API_CONFIG.TIMEOUT,
      params,
      skipAuthHeader = false,
      ...fetchOptions
    } = options;

    // Prepare URL with query parameters
    let url = `${API_CONFIG.BASE_URL}${endpoint}`;
    if (params) {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        url += `${url.includes('?') ? '&' : '?'}${queryString}`;
      }
    }

    // Set default headers
    const headers = new Headers(fetchOptions.headers);
    if (!headers.has('Content-Type') && !skipAuthHeader) {
      headers.set('Content-Type', 'application/json');
    }
    
    // Add auth token if available
    const storedUser = localStorage.getItem('equiptrak_user');
    if (storedUser && !skipAuthHeader) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.token) {
          headers.set('Authorization', `Bearer ${userData.token}`);
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
      }
    }

    // Prepare fetch options with credentials
    const config: RequestInit = {
      ...fetchOptions,
      headers,
      credentials: 'include',
      mode: 'cors'
    };

    if (API_CONFIG.DEBUG) {
      console.log(`🔷 API Request: ${config.method || 'GET'} ${url}`);
      if (config.body) {
        console.log('Request Body:', 
          typeof config.body === 'string' 
            ? JSON.parse(config.body)
            : config.body
        );
      }
    }

    // Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    config.signal = controller.signal;

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      // Parse response based on content type
      let data;
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (error) {
          console.error('Error parsing JSON response:', error);
          data = { error: 'Invalid JSON response' };
        }
      } else {
        try {
          data = await response.text();
        } catch (error) {
          console.error('Error reading response text:', error);
          data = { error: 'Failed to read response' };
        }
      }

      if (API_CONFIG.DEBUG) {
        console.log(`🔶 API Response: ${response.status} ${response.statusText}`);
        console.log('Response Data:', 
          typeof data === 'string' 
            ? data.length > 1000 
              ? data.substring(0, 1000) + '...' 
              : data 
            : data
        );
      }

      // Handle token expiration
      if (response.status === 401) {
        const errorMessage = typeof data === 'object' && data?.error 
          ? data.error 
          : 'Your session has expired. Please log in again.';
          
        // Clear user data if token is expired
        localStorage.removeItem('equiptrak_user');
        
        // Show toast message
        toast.error(errorMessage);
        
        // Redirect to login page
        window.location.href = '/login';
      }

      return {
        data: data,
        status: response.status,
        ok: response.ok,
        headers: response.headers,
        error: !response.ok 
          ? (typeof data === 'object' && data?.error ? data.error : 'Request failed') 
          : undefined
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Request failed:', error);

      // Handle abort due to timeout
      if (error.name === 'AbortError') {
        return {
          status: 0,
          ok: false,
          error: 'Request timed out'
        };
      }

      return {
        status: 0,
        ok: false,
        error: error.message || 'Network error'
      };
    }
  }

  /**
   * Convenience method for GET requests
   */
  static async get<T = any>(
    endpoint: string,
    options: ApiClientOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * Convenience method for POST requests
   */
  static async post<T = any>(
    endpoint: string,
    data: any,
    options: ApiClientOptions = {}
  ): Promise<ApiResponse<T>> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
      ...options,
    });
  }

  /**
   * Test the API connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      const response = await this.get('/api/test');
      return response.ok || response.status === 404;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

export default ApiClient; 
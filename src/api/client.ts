import { API_STATUS, apiConfig, ApiResponse } from './config';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private authToken?: string;

  constructor() {
    this.baseURL = apiConfig.baseURL;
    this.timeout = apiConfig.timeout;
    this.defaultHeaders = { ...apiConfig.headers };
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.authToken = token;
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Clear authentication token
  clearAuthToken() {
    this.authToken = undefined;
    delete this.defaultHeaders['Authorization'];
  }

  // Get headers with authentication
  private getHeaders(
    customHeaders?: Record<string, string>,
  ): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...customHeaders,
    };
  }

  // Make HTTP request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.getHeaders(
      options.headers as Record<string, string> | undefined,
    );

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting
      if (response.status === API_STATUS.RATE_LIMITED) {
        const retryAfter = response.headers.get('Retry-After');
        throw new Error(`Rate limited. Retry after ${retryAfter} seconds.`);
      }

      // Handle authentication errors
      if (response.status === API_STATUS.UNAUTHORIZED) {
        this.clearAuthToken();
        throw new Error('Authentication failed. Please log in again.');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `HTTP ${response.status}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Request timeout',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: 'Unknown error occurred',
      };
    }
  }

  // GET request
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
  ): Promise<ApiResponse<T>> {
    const url = params ? this.buildUrlWithParams(endpoint, params) : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Build URL with query parameters
  private buildUrlWithParams(
    endpoint: string,
    params: Record<string, any>,
  ): string {
    const url = new URL(endpoint, this.baseURL);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
    return url.pathname + url.search;
  }

  // Retry mechanism for failed requests
  async retryRequest<T>(
    requestFn: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<ApiResponse<T>> {
    let lastError: string = '';

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn();
        if (result.success) {
          return result;
        }
        lastError = result.error || 'Request failed';
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }

    return {
      success: false,
      error: `Request failed after ${maxRetries} attempts: ${lastError}`,
    };
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export for use in other modules
export default apiClient;

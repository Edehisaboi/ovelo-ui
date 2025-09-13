export {
  API_STATUS,
  apiConfig,
  ENDPOINTS,
  wsConfig,
  streamingConfig,
} from './config';

export type {
  ApiConfig,
  ApiError,
  ApiResponse,
  WebSocketConfig,
} from './config';

export { default as apiClient } from './client';
export { default as wsClient } from './websocket';

export type * from './types';

export { default as searchService } from './services/search.ts';
export { default as streamingService } from './services/streaming.ts';
export { default as userService } from './services/user.ts';

export { Search } from './services/search.ts';
export { User } from './services/user.ts';
export { VideoIdentificationStreamingService } from './services/streaming.ts';

/**
 * Utility API helpers.
 */
export const apiUtils = {
  /**
   * Check API health.
   */
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${apiConfig.baseURL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  /**
   * Format API error for display.
   */
  formatErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unknown error occurred';
  },

  /**
   * Retry API call with exponential backoff.
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000,
  ): Promise<T> {
    let lastError: Error;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxRetries) throw lastError;
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    throw lastError!;
  },

  /**
   * Debounce a function.
   */
  debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle a function.
   */
  throttle<T extends (...args: any[]) => any>(func: T, limit: number) {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  },
};

// --- Default Export (full API) ---
import apiClient from './client';
import {
  API_STATUS,
  apiConfig,
  ENDPOINTS,
  streamingConfig,
  wsConfig,
} from './config';
import searchService from './services/search.ts';
import streamingService from './services/streaming.ts';
import userService from './services/user.ts';


export default {
  apiClient,
  searchService,
  streamingService,
  userService,
  apiUtils,
  config: { apiConfig, wsConfig, streamingConfig, ENDPOINTS, API_STATUS },
};

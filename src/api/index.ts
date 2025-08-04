// API Configuration
export { API_STATUS, apiConfig, ENDPOINTS, wsConfig } from './config';
export type {
  ApiConfig,
  ApiError,
  ApiResponse,
  WebSocketConfig,
} from './config';

// API Client
export { default as apiClient } from './client';

// WebSocket Client
export { default as wsClient } from './websocket';

// API Types
export type {
  AnalyticsEvent,
  ContentDetailsRequest,
  ContentDetailsResponse,
  RateLimitInfo,
  SearchRequest,
  SearchResponse,
  StreamAudio,
  // Streaming types
  StreamFrame,
  StreamResponse,
  StreamSession,
  UploadProgress,
  UsageAnalytics,
  UserHistoryRequest,
  UserHistoryResponse,
  UserProfile,
  WebSocketAudioEvent,
  WebSocketErrorEvent,
  WebSocketEvent,
  WebSocketFrameEvent,
  WebSocketOutgoingEvent,
  WebSocketProgressEvent,
  WebSocketResultEvent,
} from './types';

// API Services
export { default as analyticsService } from './services/analytics.ts';
export { default as searchService } from './services/search.ts';
export { default as streamingService } from './services/streaming.ts';
export { default as userService } from './services/user.ts';
export { default as videoService } from './services/video.ts';

// Service classes for advanced usage
export { Analytics } from './services/analytics.ts';
export { Search } from './services/search.ts';
export { Streaming } from './services/streaming.ts';
export { User } from './services/user.ts';
export { Video } from './services/video.ts';

// Import config and services for utility functions
import apiClient from './client';
import { API_STATUS, apiConfig, ENDPOINTS } from './config';
import analyticsService from './services/analytics.ts';
import searchService from './services/search.ts';
import userService from './services/user.ts';
import videoService from './services/video.ts';

// Utility functions
export const apiUtils = {
  /**
   * Check if API is available
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
   * Format API error message
   */
  formatErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unknown error occurred';
  },

  /**
   * Retry API call with exponential backoff
   */
  async retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000,
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  },

  /**
   * Debounce API calls
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle API calls
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number,
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// Default export for convenience
export default {
  searchService,
  userService,
  analyticsService,
  videoService,
  apiClient,
  apiUtils,
  config: { apiConfig, ENDPOINTS, API_STATUS },
};

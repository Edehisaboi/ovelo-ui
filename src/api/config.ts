import { StatusCodes } from 'http-status-codes';
import { Layout } from '../constants/Layout.ts';

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export interface WebSocketConfig {
  baseURL: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Environment-based configuration
const getApiConfig = (): ApiConfig => {
  return {
    baseURL: __DEV__
      ? 'http://192.168.0.23:8000/v1/api' // Development server
      : 'https://api.ovelo.app/v1/api', // Production server
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': 'Moovy/1.0.0',
    },
  };
};

const getWebSocketConfig = (): WebSocketConfig => {
  return {
    baseURL: __DEV__
      ? 'ws://192.168.0.23:8000/v1/ws/identify' // Development WebSocket server
      : 'wss://api.moovy.app', // Production WebSocket server
    reconnectInterval: 3000, // 3 seconds
    maxReconnectAttempts: 0,
  };
};

const getStreamingConfig = {
  videoConfig: {
    fps: 1,
    resolution: {
      width: Layout.window.width,
      height: Layout.window.height,
    },
    format: 'base64' as const,
    quality: 80,
  },
  audioConfig: {
    sampleRate: 16000, // 16 kHz — optimal for STT, balances quality and bandwidth
    channels: 1, // Mono — reduces data and improves speech clarity
    bitsPerSample: 16, // 16-bit PCM — standard for voice processing
    audioSource: 6, // "voice recognition" mode for Android (works best for speech)
    wavFile: 'ignore_this.wav', // Ignored during streaming
    bufferSize: 800, // ≈ 100ms chunks at 16kHz mono 16-bit PCM (320 bytes)
  },
  metadata: {
    deviceInfo: 'Moovio App',
    timestamp: new Date().toISOString(),
  },
};

export const apiConfig = getApiConfig();
export const wsConfig = getWebSocketConfig();
export const streamingConfig = getStreamingConfig;

// API endpoints
export const ENDPOINTS = {
  // Video identification
  IDENTIFY_VIDEO: '/videos/identify',

  // Real-time streaming
  STREAM_VIDEO: '/stream/video',
  STREAM_AUDIO: '/stream/audio',
  STREAM_WEBSOCKET: '/ws/stream',

  // User management
  USER_PROFILE: '/user/profile',
  USER_HISTORY: '/user/history',
  USER_SETTINGS: '/user/settings',

  // Search
  SEARCH_VIDEOS: '/search/videos',
  SEARCH_MOVIES: '/search/movies',
  SEARCH_SHOWS: '/search/shows',

  // Content
  MOVIE_DETAILS: '/content/movie',
  SHOW_DETAILS: '/content/show',
  SIMILAR_CONTENT: '/content/similar',

  // Analytics
  TRACK_USAGE: '/analytics/usage',
  TRACK_ERROR: '/analytics/error',
} as const;

// API status codes
export const API_STATUS = {
  SUCCESS: StatusCodes.OK,
  CREATED: StatusCodes.CREATED,
  NO_CONTENT: StatusCodes.NO_CONTENT,
  BAD_REQUEST: StatusCodes.BAD_REQUEST,
  UNAUTHORIZED: StatusCodes.UNAUTHORIZED,
  FORBIDDEN: StatusCodes.FORBIDDEN,
  NOT_FOUND: StatusCodes.NOT_FOUND,
  RATE_LIMITED: StatusCodes.TOO_MANY_REQUESTS,
  SERVER_ERROR: StatusCodes.INTERNAL_SERVER_ERROR,
} as const;

import { VideoResult } from '../types';

// Real-time streaming types
export interface StreamFrame {
  type: 'video';
  data: string; // Base64 encoded frame data
  metadata?: {
    fps?: number;
    resolution?: { width: number; height: number };
  };
}

export interface StreamAudio {
  type: 'audio';
  data: string; // Base64 encoded audio data
  metadata?: {
    sampleRate: number;
    channels: number;
    format: 'pcm' | 'opus' | 'aac';
    bitrate: number;
    duration?: number; // Duration in milliseconds
  };
}

export interface StreamSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  status: 'connecting' | 'streaming' | 'processing' | 'completed' | 'error';
  framesSent: number;
  audioSent: number;
  error?: string;
}

export interface StreamResponse {
  success: boolean;
  sessionId: string;
  result?: VideoResult;
  confidence?: number;
  processingTime?: number;
  alternatives?: VideoResult[];
  error?: string;
}

// Search types
export interface SearchRequest {
  query: string;
  type?: 'movie' | 'show' | 'all';
  limit?: number;
  offset?: number;
  filters?: {
    year?: number;
    genre?: string;
    rating?: number;
  };
}

export interface SearchResponse {
  success: boolean;
  results: VideoResult[];
  total: number;
  page: number;
  hasMore: boolean;
  error?: string;
}

// User types
export interface UserProfile {
  id: string;
  email?: string;
  username?: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    autoSave: boolean;
    language: string;
  };
  stats: {
    totalIdentifications: number;
    successfulIdentifications: number;
    favoriteGenres: string[];
    lastActive: string;
  };
}

export interface UserHistoryRequest {
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'title' | 'confidence';
  sortOrder?: 'asc' | 'desc';
}

export interface UserHistoryResponse {
  success: boolean;
  history: VideoResult[];
  total: number;
  hasMore: boolean;
  error?: string;
}

// Content types
export interface ContentDetailsRequest {
  contentId: string;
  type: 'movie' | 'show';
  includeSimilar?: boolean;
  includeTrailer?: boolean;
}

export interface ContentDetailsResponse {
  success: boolean;
  content?: VideoResult;
  similar?: VideoResult[];
  trailer?: {
    url: string;
    duration: number;
    thumbnail: string;
  };
  error?: string;
}

// Analytics types
export interface AnalyticsEvent {
  event: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  properties?: Record<string, any>;
}

export interface UsageAnalytics {
  event:
    | 'video_identified'
    | 'search_performed'
    | 'app_opened'
    | 'error_occurred';
  videoId?: string;
  searchQuery?: string;
  errorType?: string;
  processingTime?: number;
  confidence?: number;
}

// Error types
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
    requestId?: string;
  };
}

// WebSocket event types (incoming from server)
export interface WebSocketEvent {
  type:
    | 'connected'
    | 'result'
    | 'progress'
    | 'error'
    | 'session_start'
    | 'session_end';
  connection_id?: string;
  message?: string;
  data?: any;
}

// WebSocket event types (outgoing to server)
export interface WebSocketOutgoingEvent {
  type: 'frame' | 'audio';
  connection_id?: string;
  data: any;
}

export interface WebSocketFrameEvent extends WebSocketOutgoingEvent {
  type: 'frame';
  data: {
    sessionId: string;
    frame: StreamFrame;
  };
}

export interface WebSocketAudioEvent extends WebSocketOutgoingEvent {
  type: 'audio';
  data: {
    sessionId: string;
    audio: StreamAudio;
  };
}

export interface WebSocketResultEvent extends WebSocketEvent {
  type: 'result';
  data: StreamResponse;
}

export interface WebSocketProgressEvent extends WebSocketEvent {
  type: 'progress';
  data: {
    sessionId: string;
    progress: number;
    message?: string;
  };
}

export interface WebSocketErrorEvent extends WebSocketEvent {
  type: 'error';
  data: {
    sessionId: string;
    error: string;
    code?: string;
  };
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Rate limiting
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp
  retryAfter?: number; // Seconds to wait
}

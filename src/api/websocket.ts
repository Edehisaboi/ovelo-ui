import { wsConfig } from './config';
import {
  StreamAudio,
  StreamFrame,
  StreamResponse,
  WebSocketAudioEvent,
  WebSocketEvent,
  WebSocketFrameEvent,
} from './types';

export interface WebSocketCallbacks {
  onResult?: (result: StreamResponse) => void;
  onProgress?: (progress: number, message?: string) => void;
  onError?: (error: string, code?: string) => void;
  onConnect?: (sessionId: string) => void;
  onDisconnect?: () => void;
  onReconnect?: (attempt: number) => void;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private sessionId: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private callbacks: WebSocketCallbacks = {};
  private isConnecting = false;
  private isManualClose = false;

  constructor(private endpoint: string = wsConfig.baseURL) {}

  /**
   * Connect to WebSocket server
   */
  async connect(
    sessionId: string,
    callbacks: WebSocketCallbacks = {},
  ): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return true;
    }

    this.sessionId = sessionId;
    this.callbacks = callbacks;
    this.isManualClose = false;

    return new Promise(resolve => {
      try {
        this.ws = new WebSocket(this.endpoint);
        this.setupEventHandlers(resolve);
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        this.callbacks.onError?.(
          'Failed to create ws connection',
          'CONNECTION_ERROR',
        );
        resolve(false);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    this.isManualClose = true;
    this.clearTimers();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send a video frame to WebSocket server
   */
  sendFrame(frame: StreamFrame): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    // Ensure this is a video frame
    if (frame.type !== 'video') {
      console.warn(
        'sendFrame called with non-video frame, use sendAudio for audio data',
      );
      return false;
    }

    const event: WebSocketFrameEvent = {
      type: 'frame',
      data: {
        sessionId: this.sessionId!,
        frame,
      },
    };

    this.ws.send(JSON.stringify(event));
    return true;
  }

  /**
   * Send audio data to WebSocket server
   * Audio data is handled distinctly from video frames
   */
  sendAudio(audio: StreamAudio): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    // Ensure this is an audio frame
    if (audio.type !== 'audio') {
      console.warn(
        'sendAudio called with non-audio frame, use sendFrame for video data',
      );
      return false;
    }

    const event: WebSocketAudioEvent = {
      type: 'audio',
      data: {
        sessionId: this.sessionId!,
        audio,
      },
    };

    this.ws.send(JSON.stringify(event));
    return true;
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(resolve: (value: boolean) => void): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      resolve(true);
    };

    this.ws.onmessage = event => {
      try {
        const wsEvent: WebSocketEvent = JSON.parse(event.data);
        this.handleWebSocketEvent(wsEvent);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onclose = event => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      this.clearTimers();
      this.callbacks.onDisconnect?.();

      if (
        !this.isManualClose &&
        this.reconnectAttempts < wsConfig.maxReconnectAttempts
      ) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = error => {
      console.error('WebSocket error:', error);
      this.callbacks.onError?.('WebSocket connection error');
    };
  }

  /**
   * Handle incoming WebSocket events
   */
  private handleWebSocketEvent(event: WebSocketEvent): void {
    switch (event.type) {
      case 'connected':
        this.sessionId = event.connection_id!;
        console.log(
          'Server connection established with ID:',
          event.connection_id,
        );
        this.callbacks.onConnect?.(event.connection_id!);
        break;

      case 'result':
        this.callbacks.onResult?.(event.data);
        break;

      case 'progress':
        this.callbacks.onProgress?.(event.data.progress, event.data.message);
        break;

      case 'error':
        this.callbacks.onError?.(event.data.error, event.data.code);
        break;

      default:
        console.warn('Unknown WebSocket event type:', event.type);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectAttempts++;
    const delay = wsConfig.reconnectInterval * this.reconnectAttempts;

    this.reconnectTimeout = setTimeout(() => {
      if (!this.isManualClose) {
        console.log(
          `Attempting to reconnect (${this.reconnectAttempts}/${wsConfig.maxReconnectAttempts})`,
        );
        this.callbacks.onReconnect?.(this.reconnectAttempts);
        void this.connect(this.sessionId!, this.callbacks);
      }
    }, delay);
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    if (!this.ws) return 'disconnected';
    if (this.isConnecting) return 'connecting';
    if (this.ws.readyState === WebSocket.OPEN && this.sessionId) {
      return 'connected';
    }
    return 'disconnected';
  }

  /**
   * Get session ID
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  /**
   * Check if connection is established with server
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.sessionId !== null;
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();
export default wsClient;

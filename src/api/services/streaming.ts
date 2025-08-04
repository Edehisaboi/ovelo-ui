import {
  StreamAudio,
  StreamFrame,
  StreamResponse,
  StreamSession,
} from '../types';
import { wsClient } from '../websocket';
import { streamingConfig } from '../config';

export interface StreamingCallbacks {
  onResult?: (result: StreamResponse) => void;
  onError?: (error: string) => void;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (sessionId: string) => void;
  onFrameProcessorReady?: (callback: (base64: string) => void) => void;
  onAudioProcessorReady?: (callback: (base64: string) => void) => void;
}

export class Streaming {
  private sessionId: string | null = null;
  private currentSession: StreamSession | null = null;
  private isStreaming = false;

  /**
   * Start streaming with real-time capture
   */
  async startStreaming(
    callbacks: StreamingCallbacks = {},
    cameraRef?: any,
    audioRecording?: any,
  ): Promise<StreamSession> {
    if (this.isStreaming) {
      throw new Error('Streaming session already in progress');
    }
    if (!cameraRef || !audioRecording) {
      throw new Error('Camera and audio recording references are required');
    }
    if (!streamingConfig.videoConfig || !streamingConfig.audioConfig) {
      throw new Error('Streaming configuration is not set');
    }

    this.currentSession = {
      sessionId: this.sessionId!,
      startTime: Date.now(),
      status: 'connecting',
      framesSent: 0,
      audioSent: 0,
    };

    this.isStreaming = true;

    try {
      // Connect to WebSocket
      const connected = await wsClient.connect(this.sessionId!, {
        onResult: callbacks.onResult,
        onError: callbacks.onError,
        onConnect: (serverConnectionId: string) => {
          console.log(
            'WebSocket connected with server connection ID:',
            serverConnectionId,
          );

          // Update session with server's connection ID
          this.sessionId = serverConnectionId;
          this.currentSession!.sessionId = serverConnectionId;
          this.currentSession!.status = 'streaming';
          callbacks.onSessionStart?.(serverConnectionId);

          // Provide frame processor callback to UI
          if (callbacks.onFrameProcessorReady) {
            callbacks.onFrameProcessorReady((base64: string) => {
              if (this.isStreaming && wsClient.isConnected()) {
                const frame: StreamFrame = {
                  type: 'video',
                  data: base64,
                  metadata: {
                    fps: streamingConfig.videoConfig?.fps,
                    resolution: streamingConfig.videoConfig?.resolution,
                  },
                };
                this.sendVideoFrame(frame);
              }
            });
          }

          // Provide audio processor callback to UI
          if (callbacks.onAudioProcessorReady) {
            callbacks.onAudioProcessorReady((base64: string) => {
              if (this.isStreaming && wsClient.isConnected()) {
                const audio: StreamAudio = {
                  type: 'audio',
                  data: base64,
                  metadata: {
                    sampleRate: streamingConfig.audioConfig?.sampleRate,
                    channels: streamingConfig.audioConfig?.channels,
                    format: streamingConfig.audioConfig?.format,
                    bitrate: streamingConfig.audioConfig?.bitrate,
                    duration: 100,
                  },
                };
                this.sendAudio(audio);
              }
            });
          }
        },
        onDisconnect: () => {
          console.log('WebSocket disconnected');
          if (this.isStreaming) {
            this.isStreaming = false;
            callbacks.onSessionEnd?.(this.sessionId || '');
          }
        },
      });

      if (!connected) {
        throw new Error('Failed to connect to WebSocket server');
      }

      return this.currentSession;
    } catch (error) {
      this.isStreaming = false;
      this.currentSession = null;
      throw error;
    }
  }

  /**
   * Stop streaming
   */
  stopStreaming(): void {
    if (!this.isStreaming) return;

    this.isStreaming = false;

    // Update session
    if (this.currentSession) {
      this.currentSession.endTime = Date.now();
      this.currentSession.status = 'completed';
    }

    // Disconnect WebSocket
    wsClient.disconnect();

    console.log('Streaming stopped');
  }

  /**
   * Send video frame via WebSocket
   */
  private sendVideoFrame(frame: StreamFrame): boolean {
    const sent = wsClient.sendFrame(frame);
    if (sent && this.currentSession) {
      this.currentSession.framesSent++;
    }
    return sent;
  }

  /**
   * Send audio data via WebSocket
   */
  private sendAudio(audio: StreamAudio): boolean {
    const sent = wsClient.sendAudio(audio);
    if (sent && this.currentSession) {
      this.currentSession.audioSent++;
    }
    return sent;
  }

  /**
   * Get current streaming session
   */
  getCurrentSession(): StreamSession | null {
    return this.currentSession;
  }

  /**
   * Check if currently streaming
   */
  isCurrentlyStreaming(): boolean {
    return this.isStreaming;
  }

  /**
   * Get WebSocket connection status
   */
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    return wsClient.getConnectionStatus();
  }

  /**
   * Get streaming statistics
   */
  getStreamingStats(): {
    sessionId: string | null;
    isStreaming: boolean;
    framesSent: number;
    audioSent: number;
    duration: number;
    connectionStatus: string;
  } {
    const duration = this.currentSession
      ? (this.currentSession.endTime || Date.now()) -
        this.currentSession.startTime
      : 0;

    return {
      sessionId: this.currentSession?.sessionId || null,
      isStreaming: this.isStreaming,
      framesSent: this.currentSession?.framesSent || 0,
      audioSent: this.currentSession?.audioSent || 0,
      duration,
      connectionStatus: this.getConnectionStatus(),
    };
  }
}

// Export singleton instance
const streamingService = new Streaming();
export default streamingService;

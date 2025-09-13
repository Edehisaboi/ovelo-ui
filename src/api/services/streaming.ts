import { streamingConfig } from '../config';
import {
  StreamAudio,
  StreamFrame,
  StreamResponse,
  StreamSession,
} from '../types';
import { wsClient } from '../websocket';

export interface StreamingCallbacks {
  onResult?: (result: StreamResponse) => void;
  onError?: (error: string) => void;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: (sessionId: string) => void;
  onFrameProcessorReady?: (callback: (base64: string) => void) => void;
  onAudioProcessorReady?: (callback: (base64: string) => void) => void;
}

export class VideoIdentificationStreamingService {
  private currentSessionId: string | null = null;
  private activeSession: StreamSession | null = null;
  private isStreamingActive = false;

  /**
   * Start real-time video identification streaming
   */
  async startVideoIdentification(
    callbacks: StreamingCallbacks = {},
  ): Promise<StreamSession> {
    if (this.isStreamingActive) {
      throw new Error('Video identification session already in progress');
    }
    if (!streamingConfig.videoConfig || !streamingConfig.audioConfig) {
      throw new Error('Streaming configuration is not properly set');
    }

    this.activeSession = {
      sessionId: this.currentSessionId!,
      startTime: Date.now(),
      status: 'connecting',
      framesSent: 0,
      audioSent: 0,
    };

    this.isStreamingActive = true;

    try {
      // Establish WebSocket connection
      const connectionEstablished = await wsClient.connect(
        this.currentSessionId!,
        {
          onResult: callbacks.onResult,
          onError: callbacks.onError,
          onConnect: (serverConnectionId: string) => {
            console.log(
              'WebSocket connection established with server ID:',
              serverConnectionId,
            );

            // Update session with server's connection ID
            this.currentSessionId = serverConnectionId;
            this.activeSession!.sessionId = serverConnectionId;
            this.activeSession!.status = 'streaming';
            callbacks.onSessionStart?.(serverConnectionId);

            // Setup frame processor callback for UI
            if (callbacks.onFrameProcessorReady) {
              callbacks.onFrameProcessorReady((frameData: string) => {
                if (this.isStreamingActive && wsClient.isConnected()) {
                  const videoFrame: StreamFrame = {
                    type: 'frame',
                    data: frameData,
                  };
                  this.sendVideoFrame(videoFrame);
                }
              });
            }

            // Setup audio processor callback for UI
            if (callbacks.onAudioProcessorReady) {
              callbacks.onAudioProcessorReady((audioData: string) => {
                if (this.isStreamingActive && wsClient.isConnected()) {
                  const audioFrame: StreamAudio = {
                    type: 'audio',
                    data: audioData,
                  };
                  this.sendAudioFrame(audioFrame);
                }
              });
            }
          },
          onDisconnect: () => {
            console.log('WebSocket connection disconnected');
            if (this.isStreamingActive) {
              this.isStreamingActive = false;
              callbacks.onSessionEnd?.(this.currentSessionId || '');
            }
          },
        },
      );

      if (!connectionEstablished) {
        this.isStreamingActive = false;
        this.activeSession = null;
        return Promise.reject(
          new Error('Failed to establish WebSocket connection to server'),
        );
      }

      return this.activeSession;
    } catch (error) {
      this.isStreamingActive = false;
      this.activeSession = null;
      throw error;
    }
  }

  /**
   * Stop video identification streaming
   */
  stopVideoIdentification(): void {
    if (!this.isStreamingActive) return;

    this.isStreamingActive = false;

    // Update session status
    if (this.activeSession) {
      this.activeSession.endTime = Date.now();
      this.activeSession.status = 'completed';
    }

    // Close WebSocket connection
    wsClient.disconnect();

    console.log('Video identification streaming stopped');
  }

  /**
   * Send video frame data via WebSocket
   */
  private sendVideoFrame(videoFrame: StreamFrame): boolean {
    const frameSent = wsClient.sendFrame(videoFrame);
    if (frameSent && this.activeSession) {
      this.activeSession.framesSent++;
    }
    return frameSent;
  }

  /**
   * Send audio frame data via WebSocket
   */
  private sendAudioFrame(audioFrame: StreamAudio): boolean {
    const audioSent = wsClient.sendAudio(audioFrame);
    if (audioSent && this.activeSession) {
      this.activeSession.audioSent++;
    }
    return audioSent;
  }

  /**
   * Get current streaming session information
   */
  getCurrentSession(): StreamSession | null {
    return this.activeSession;
  }

  /**
   * Check if video identification is currently active
   */
  isVideoIdentificationActive(): boolean {
    return this.isStreamingActive;
  }

  /**
   * Get WebSocket connection status
   */
  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' {
    return wsClient.getConnectionStatus();
  }

  /**
   * Get streaming session statistics
   */
  getStreamingStatistics(): {
    sessionId: string | null;
    isStreamingActive: boolean;
    framesSent: number;
    audioSent: number;
    sessionDuration: number;
    connectionStatus: string;
  } {
    const sessionDuration = this.activeSession
      ? (this.activeSession.endTime || Date.now()) -
        this.activeSession.startTime
      : 0;

    return {
      sessionId: this.activeSession?.sessionId || null,
      isStreamingActive: this.isStreamingActive,
      framesSent: this.activeSession?.framesSent || 0,
      audioSent: this.activeSession?.audioSent || 0,
      sessionDuration,
      connectionStatus: this.getConnectionStatus(),
    };
  }
}

// Export singleton instance
const videoIdentificationService = new VideoIdentificationStreamingService();
export default videoIdentificationService;

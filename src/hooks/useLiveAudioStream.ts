import { useEffect, useRef } from 'react';
import LiveAudioStream from 'react-native-live-audio-stream';
import { streamingConfig } from '../api/config';

type AudioDataCallback = (base64: string) => void;

/**
 * Hook to stream live base64 audio PCM chunks
 * Supports dynamic callback assignment for synchronization with frame processing
 */
export function useLiveAudioStream(initialCallback?: AudioDataCallback) {
  const audioCallbackRef = useRef<AudioDataCallback | null>(
    initialCallback || null,
  );

  // Update callback reference
  const setAudioCallback = (callback: AudioDataCallback) => {
    audioCallbackRef.current = callback;
  };

  // Start audio streaming
  const start = async (): Promise<boolean> => {
    try {
      LiveAudioStream.init(streamingConfig.audioConfig);
      LiveAudioStream.on('data', (audioData: string) => {
        if (audioCallbackRef.current) {
          audioCallbackRef.current(audioData);
        }
      });
      LiveAudioStream.start();
      return true;
    } catch (error) {
      console.error('Failed to start audio streaming:', error);
      return false;
    }
  };

  // Stop audio streaming
  const stop = async (): Promise<void> => {
    try {
      await LiveAudioStream.stop?.();
    } catch (error) {
      console.error('Failed to stop audio streaming:', error);
    }
  };

  // Cleanup on un-mount
  useEffect(() => {
    return () => {
      void stop();
    };
  }, []);

  return {
    start,
    stop,
    setAudioCallback,
  };
}

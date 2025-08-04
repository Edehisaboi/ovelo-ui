import { StreamingCallbacks } from '../api/services/streaming';
import { StreamResponse } from '../api';
import { VideoResult } from '../types';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from 'react';
import streamingService from '../api/services/streaming';

// State interface
interface VideoState {
  history: VideoResult[];
  current: VideoResult | null;
  isStreaming: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

// Action types
type VideoAction =
  | { type: 'SET_CURRENT'; payload: VideoResult | null }
  | { type: 'ADD_TO_HISTORY'; payload: VideoResult }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SYNC_STREAMING_STATE' };

// Initial state
const initialState: VideoState = {
  history: [],
  current: null,
  isStreaming: streamingService.isCurrentlyStreaming(),
  connectionStatus: streamingService.getConnectionStatus(),
};

// Reducer function
function videoReducer(state: VideoState, action: VideoAction): VideoState {
  switch (action.type) {
    case 'SET_CURRENT':
      return { ...state, current: action.payload };
    case 'ADD_TO_HISTORY':
      return { ...state, history: [action.payload, ...state.history] };
    case 'CLEAR_HISTORY':
      return { ...state, history: [] };
    case 'SYNC_STREAMING_STATE':
      return {
        ...state,
        isStreaming: streamingService.isCurrentlyStreaming(),
        connectionStatus: streamingService.getConnectionStatus(),
      };
    default:
      return state;
  }
}

// Context interface
interface VideoContextType {
  // State
  history: VideoResult[];
  current: VideoResult | null;
  isStreaming: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';

  // Actions
  startStreamingIdentification: (
    callbacks?: StreamingCallbacks,
    cameraRef?: any,
    audioRef?: any,
  ) => Promise<void>;
  stopStreamingIdentification: () => void;
  getStreamingStats: () => any;
  clearHistory: () => void;
  setCurrent: (video: VideoResult | null) => void;
  addToHistory: (video: VideoResult) => void;
  syncStreamingState: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(videoReducer, initialState);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const addToHistory = useCallback((video: VideoResult) => {
    dispatch({ type: 'ADD_TO_HISTORY', payload: video });
  }, []);

  const setCurrent = useCallback((video: VideoResult | null) => {
    dispatch({ type: 'SET_CURRENT', payload: video });
  }, []);

  const syncStreamingState = useCallback(() => {
    dispatch({ type: 'SYNC_STREAMING_STATE' });
  }, []);

  const startStreamingIdentification = useCallback(
    async (callbacks?: StreamingCallbacks, cameraRef?: any, audioRef?: any) => {
      try {
        await streamingService.startStreaming(
          {
            ...callbacks,
            onSessionStart: (sessionId: string) => {
              syncStreamingState();
              callbacks?.onSessionStart?.(sessionId);
            },
            onResult: (result: StreamResponse) => {
              if (result.success && result.result) {
                dispatch({ type: 'SET_CURRENT', payload: result.result });
                dispatch({ type: 'ADD_TO_HISTORY', payload: result.result });
              }
              callbacks?.onResult?.(result);
            },
            onError: (error: string) => {
              syncStreamingState();
              callbacks?.onError?.(error);
            },
            onSessionEnd: (sessionId: string) => {
              syncStreamingState();
              callbacks?.onSessionEnd?.(sessionId);
            },
          },
          cameraRef,
          audioRef,
        );
      } catch (error) {
        syncStreamingState();
        throw error;
      }
    },
    [syncStreamingState],
  );

  const stopStreamingIdentification = useCallback(() => {
    streamingService.stopStreaming();
    syncStreamingState();
  }, [syncStreamingState]);

  const getStreamingStats = useCallback(() => {
    return streamingService.getStreamingStats();
  }, []);

  return (
    <VideoContext.Provider
      value={{
        // State
        history: state.history,
        current: state.current,
        isStreaming: state.isStreaming,
        connectionStatus: state.connectionStatus,

        // Actions
        startStreamingIdentification,
        stopStreamingIdentification,
        getStreamingStats,
        clearHistory,
        setCurrent,
        addToHistory,
        syncStreamingState,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideo = () => {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error('useVideo must be used within VideoProvider');
  return ctx;
};

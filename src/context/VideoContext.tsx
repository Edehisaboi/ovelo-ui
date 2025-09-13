import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useReducer,
} from 'react';
import { StreamResponse } from '../api';
import videoIdentificationService, {
  StreamingCallbacks,
} from '../api/services/streaming';
import { VideoResult } from '../types';

// State interface
interface VideoIdentificationState {
  identificationHistory: VideoResult[];
  isIdentificationActive: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';
}

// Action types
type VideoIdentificationAction =
  | { type: 'ADD_TO_IDENTIFICATION_HISTORY'; payload: VideoResult }
  | { type: 'CLEAR_IDENTIFICATION_HISTORY' }
  | { type: 'SYNC_IDENTIFICATION_STATE' };

// Initial state
const initialState: VideoIdentificationState = {
  identificationHistory: [],
  isIdentificationActive:
    videoIdentificationService.isVideoIdentificationActive(),
  connectionStatus: videoIdentificationService.getConnectionStatus(),
};

// Reducer function
function videoIdentificationReducer(
  state: VideoIdentificationState,
  action: VideoIdentificationAction,
): VideoIdentificationState {
  switch (action.type) {
    case 'ADD_TO_IDENTIFICATION_HISTORY':
      return {
        ...state,
        identificationHistory: [action.payload, ...state.identificationHistory],
      };
    case 'CLEAR_IDENTIFICATION_HISTORY':
      return { ...state, identificationHistory: [] };
    case 'SYNC_IDENTIFICATION_STATE':
      return {
        ...state,
        isIdentificationActive:
          videoIdentificationService.isVideoIdentificationActive(),
        connectionStatus: videoIdentificationService.getConnectionStatus(),
      };
    default:
      return state;
  }
}

// Context interface
interface VideoIdentificationContextType {
  // State
  identificationHistory: VideoResult[];
  isIdentificationActive: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected';

  // Actions
  startVideoIdentification: (callbacks?: StreamingCallbacks) => Promise<void>;
  stopVideoIdentification: () => void;
  getIdentificationStatistics: () => any;
  clearIdentificationHistory: () => void;
  addToIdentificationHistory: (video: VideoResult) => void;
  syncIdentificationState: () => void;
}

const VideoIdentificationContext = createContext<
  VideoIdentificationContextType | undefined
>(undefined);

export const VideoIdentificationProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [state, dispatch] = useReducer(
    videoIdentificationReducer,
    initialState,
  );

  const clearIdentificationHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_IDENTIFICATION_HISTORY' });
  }, []);

  const addToIdentificationHistory = useCallback((video: VideoResult) => {
    dispatch({ type: 'ADD_TO_IDENTIFICATION_HISTORY', payload: video });
  }, []);

  const syncIdentificationState = useCallback(() => {
    dispatch({ type: 'SYNC_IDENTIFICATION_STATE' });
  }, []);

  const startVideoIdentification = useCallback(
    async (callbacks?: StreamingCallbacks) => {
      try {
        await videoIdentificationService.startVideoIdentification({
          ...callbacks,
          onSessionStart: (sessionId: string) => {
            syncIdentificationState();
            callbacks?.onSessionStart?.(sessionId);
          },
          onResult: (result: StreamResponse) => {
            if (result.success && result.result) {
              dispatch({
                type: 'ADD_TO_IDENTIFICATION_HISTORY',
                payload: result.result,
              });
            }
            callbacks?.onResult?.(result);
          },
          onError: (error: string) => {
            syncIdentificationState();
            callbacks?.onError?.(error);
          },
          onSessionEnd: (sessionId: string) => {
            syncIdentificationState();
            callbacks?.onSessionEnd?.(sessionId);
          },
        });
      } catch (error) {
        syncIdentificationState();
        throw error;
      }
    },
    [syncIdentificationState],
  );

  const stopVideoIdentification = useCallback(() => {
    videoIdentificationService.stopVideoIdentification();
    syncIdentificationState();
  }, [syncIdentificationState]);

  const getIdentificationStatistics = useCallback(() => {
    return videoIdentificationService.getStreamingStatistics();
  }, []);

  return (
    <VideoIdentificationContext.Provider
      value={{
        // State
        identificationHistory: state.identificationHistory,
        isIdentificationActive: state.isIdentificationActive,
        connectionStatus: state.connectionStatus,

        // Actions
        startVideoIdentification,
        stopVideoIdentification,
        getIdentificationStatistics,
        clearIdentificationHistory,
        addToIdentificationHistory,
        syncIdentificationState,
      }}
    >
      {children}
    </VideoIdentificationContext.Provider>
  );
};

export const useVideoIdentification = () => {
  const context = useContext(VideoIdentificationContext);
  if (!context) {
    throw new Error(
      'useVideoIdentification must be used within VideoIdentificationProvider',
    );
  }
  return context;
};

export const useVideo = useVideoIdentification;

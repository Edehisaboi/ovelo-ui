export interface VideoResult {
  id?: string;
  title?: string;
  posterUrl?: string;
  year?: string;
  director?: string;
  genre?: string;
  description?: string;
  trailerUrl?: string;
  tmdbRating?: number;
  imdbRating?: number;
  duration?: string;
  source?: 'camera' | 'screen';
  identifiedAt: Date;
}

export interface HistoryItem {
  id: string;
  videoResult: VideoResult;
  timestamp: Date;
}

export interface AppSettings {
  notifications: boolean;
  autoSave: boolean;
  identifyOnStart: boolean;
  theme: 'light' | 'dark';
}

export interface CameraState {
  isRecording: boolean;
  recordingTime: number;
  hasPermission: boolean;
  error?: string;
}

export interface ScreenRecordingState {
  isRecording: boolean;
  recordingTime: number;
  hasPermission: boolean;
  error?: string;
}

export type RootStackParamList = {
  Home: undefined;
  Camera: undefined;
  Processing: { source: 'camera' | 'screen' };
  Results: { videoResult: VideoResult };
  History: undefined;
  Settings: undefined;
  Welcome: undefined;
};

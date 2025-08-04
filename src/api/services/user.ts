import { VideoResult } from '../../types';
import apiClient from '../client';
import { ENDPOINTS } from '../config';
import {
  UsageAnalytics,
  UserHistoryRequest,
  UserHistoryResponse,
  UserProfile,
} from '../types';

export class User {
  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get<UserProfile>(ENDPOINTS.USER_PROFILE);

      if (!response.success) {
        return null;
      }

      return response.data || null;
    } catch (error) {
      console.error('Get user profile failed:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const response = await apiClient.put(ENDPOINTS.USER_PROFILE, updates);
      return response.success;
    } catch (error) {
      console.error('Update user profile failed:', error);
      return false;
    }
  }

  /**
   * Get user history
   */
  async getUserHistory(
    request: UserHistoryRequest = {},
  ): Promise<UserHistoryResponse> {
    try {
      const response = await apiClient.get<UserHistoryResponse>(
        ENDPOINTS.USER_HISTORY,
        {
          limit: request.limit || 20,
          offset: request.offset || 0,
          sortBy: request.sortBy || 'date',
          sortOrder: request.sortOrder || 'desc',
        },
      );

      if (!response.success) {
        return {
          success: false,
          history: [],
          total: 0,
          hasMore: false,
          error: response.error,
        };
      }

      return (
        response.data || {
          success: false,
          history: [],
          total: 0,
          hasMore: false,
          error: 'No data received',
        }
      );
    } catch (error) {
      console.error('Get user history failed:', error);
      return {
        success: false,
        history: [],
        total: 0,
        hasMore: false,
        error: error instanceof Error ? error.message : 'History fetch failed',
      };
    }
  }

  /**
   * Add video to user history
   */
  async addToHistory(videoResult: VideoResult): Promise<boolean> {
    try {
      const response = await apiClient.post(ENDPOINTS.USER_HISTORY, {
        videoResult,
        timestamp: new Date().toISOString(),
      });
      return response.success;
    } catch (error) {
      console.error('Add to history failed:', error);
      return false;
    }
  }

  /**
   * Remove video from history
   */
  async removeFromHistory(videoId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(
        `${ENDPOINTS.USER_HISTORY}/${videoId}`,
      );
      return response.success;
    } catch (error) {
      console.error('Remove from history failed:', error);
      return false;
    }
  }

  /**
   * Clear user history
   */
  async clearHistory(): Promise<boolean> {
    try {
      const response = await apiClient.delete(ENDPOINTS.USER_HISTORY);
      return response.success;
    } catch (error) {
      console.error('Clear history failed:', error);
      return false;
    }
  }

  /**
   * Get user settings
   */
  async getUserSettings(): Promise<any> {
    try {
      const response = await apiClient.get(ENDPOINTS.USER_SETTINGS);

      if (!response.success) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Get user settings failed:', error);
      return null;
    }
  }

  /**
   * Update user settings
   */
  async updateUserSettings(settings: any): Promise<boolean> {
    try {
      const response = await apiClient.put(ENDPOINTS.USER_SETTINGS, settings);
      return response.success;
    } catch (error) {
      console.error('Update user settings failed:', error);
      return false;
    }
  }

  /**
   * Track user analytics
   */
  async trackAnalytics(event: UsageAnalytics): Promise<boolean> {
    try {
      const response = await apiClient.post(ENDPOINTS.TRACK_USAGE, {
        ...event,
        timestamp: new Date().toISOString(),
      });
      return response.success;
    } catch (error) {
      console.error('Track analytics failed:', error);
      return false;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalIdentifications: number;
    successfulIdentifications: number;
    favoriteGenres: string[];
    averageConfidence: number;
    lastActive: string;
  } | null> {
    try {
      const response = await apiClient.get(`${ENDPOINTS.USER_PROFILE}/stats`);

      if (!response.success) {
        return null;
      }

      return response.data as {
        totalIdentifications: number;
        successfulIdentifications: number;
        favoriteGenres: string[];
        averageConfidence: number;
        lastActive: string;
      } | null;
    } catch (error) {
      console.error('Get user stats failed:', error);
      return null;
    }
  }

  /**
   * Get user favorites
   */
  async getFavorites(): Promise<VideoResult[]> {
    try {
      const response = await apiClient.get<{ favorites: VideoResult[] }>(
        `${ENDPOINTS.USER_PROFILE}/favorites`,
      );

      if (!response.success) {
        return [];
      }

      return response.data?.favorites || [];
    } catch (error) {
      console.error('Get favorites failed:', error);
      return [];
    }
  }

  /**
   * Add to favorites
   */
  async addToFavorites(videoId: string): Promise<boolean> {
    try {
      const response = await apiClient.post(
        `${ENDPOINTS.USER_PROFILE}/favorites`,
        {
          videoId,
        },
      );
      return response.success;
    } catch (error) {
      console.error('Add to favorites failed:', error);
      return false;
    }
  }

  /**
   * Remove from favorites
   */
  async removeFromFavorites(videoId: string): Promise<boolean> {
    try {
      const response = await apiClient.delete(
        `${ENDPOINTS.USER_PROFILE}/favorites/${videoId}`,
      );
      return response.success;
    } catch (error) {
      console.error('Remove from favorites failed:', error);
      return false;
    }
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<{
    theme: 'light' | 'dark' | 'auto';
    notifications: boolean;
    autoSave: boolean;
    language: string;
    privacySettings: {
      shareAnalytics: boolean;
      shareHistory: boolean;
    };
  } | null> {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.USER_SETTINGS}/preferences`,
      );

      if (!response.success) {
        return null;
      }

      return response.data as {
        theme: 'light' | 'dark' | 'auto';
        notifications: boolean;
        autoSave: boolean;
        language: string;
        privacySettings: {
          shareAnalytics: boolean;
          shareHistory: boolean;
        };
      } | null;
    } catch (error) {
      console.error('Get user preferences failed:', error);
      return null;
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(preferences: any): Promise<boolean> {
    try {
      const response = await apiClient.put(
        `${ENDPOINTS.USER_SETTINGS}/preferences`,
        preferences,
      );
      return response.success;
    } catch (error) {
      console.error('Update user preferences failed:', error);
      return false;
    }
  }

  /**
   * Export user data
   */
  async exportUserData(): Promise<{
    profile: UserProfile;
    history: VideoResult[];
    settings: any;
    stats: any;
  } | null> {
    try {
      const response = await apiClient.get(`${ENDPOINTS.USER_PROFILE}/export`);

      if (!response.success) {
        return null;
      }

      return response.data as {
        profile: UserProfile;
        history: VideoResult[];
        settings: any;
        stats: any;
      } | null;
    } catch (error) {
      console.error('Export user data failed:', error);
      return null;
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<boolean> {
    try {
      const response = await apiClient.delete(ENDPOINTS.USER_PROFILE);
      return response.success;
    } catch (error) {
      console.error('Delete account failed:', error);
      return false;
    }
  }

  /**
   * Get user activity feed
   */
  async getActivityFeed(limit: number = 20): Promise<{
    activities: Array<{
      id: string;
      type: 'identification' | 'favorite' | 'search';
      timestamp: string;
      data: any;
    }>;
    hasMore: boolean;
  }> {
    try {
      const response = await apiClient.get(
        `${ENDPOINTS.USER_PROFILE}/activity`,
        {
          limit,
        },
      );

      if (!response.success) {
        return {
          activities: [],
          hasMore: false,
        };
      }

      return response.data as {
        activities: Array<{
          id: string;
          type: 'identification' | 'favorite' | 'search';
          timestamp: string;
          data: any;
        }>;
        hasMore: boolean;
      };
    } catch (error) {
      console.error('Get activity feed failed:', error);
      return {
        activities: [],
        hasMore: false,
      };
    }
  }

  /**
   * Sync user data
   */
  async syncUserData(): Promise<boolean> {
    try {
      const response = await apiClient.post(`${ENDPOINTS.USER_PROFILE}/sync`);
      return response.success;
    } catch (error) {
      console.error('Sync user data failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userService = new User();
export default userService;

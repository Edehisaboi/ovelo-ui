import apiClient from '../client';
import { ENDPOINTS } from '../config';
import { AnalyticsEvent, UsageAnalytics } from '../types';

export class Analytics {
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize analytics
   */
  initialize(userId?: string): void {
    this.userId = userId;
    this.trackEvent('app_initialized', {
      sessionId: this.sessionId,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Track app usage analytics
   */
  async trackUsage(event: UsageAnalytics): Promise<boolean> {
    if (!this.isEnabled) return true;

    try {
      const response = await apiClient.post(ENDPOINTS.TRACK_USAGE, {
        ...event,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: new Date().toISOString(),
      });
      return response.success;
    } catch (error) {
      console.error('Track usage failed:', error);
      return false;
    }
  }

  /**
   * Track custom events
   */
  async trackEvent(
    event: string,
    properties?: Record<string, any>,
  ): Promise<boolean> {
    if (!this.isEnabled) return true;

    try {
      const analyticsEvent: AnalyticsEvent = {
        event,
        timestamp: new Date().toISOString(),
        userId: this.userId,
        sessionId: this.sessionId,
        properties,
      };

      const response = await apiClient.post(
        ENDPOINTS.TRACK_USAGE,
        analyticsEvent,
      );
      return response.success;
    } catch (error) {
      console.error('Track event failed:', error);
      return false;
    }
  }

  /**
   * Track video identification
   */
  async trackVideoIdentification(data: {
    videoId?: string;
    processingTime: number;
    confidence: number;
    source: 'camera' | 'screen';
    success: boolean;
    error?: string;
  }): Promise<boolean> {
    return this.trackUsage({
      event: 'video_identified',
      videoId: data.videoId,
      processingTime: data.processingTime,
      confidence: data.confidence,
      errorType: data.error,
    });
  }

  /**
   * Track search activity
   */
  async trackSearch(data: {
    query: string;
    resultsCount: number;
    processingTime: number;
    type: 'text' | 'voice';
  }): Promise<boolean> {
    return this.trackUsage({
      event: 'search_performed',
      searchQuery: data.query,
      processingTime: data.processingTime,
    });
  }

  /**
   * Track app open
   */
  async trackAppOpen(): Promise<boolean> {
    return this.trackUsage({
      event: 'app_opened',
    });
  }

  /**
   * Track error occurrences
   */
  async trackError(data: {
    errorType: string;
    errorMessage: string;
    stackTrace?: string;
    context?: Record<string, any>;
  }): Promise<boolean> {
    try {
      const response = await apiClient.post(ENDPOINTS.TRACK_ERROR, {
        ...data,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: new Date().toISOString(),
      });
      return response.success;
    } catch (error) {
      console.error('Track error failed:', error);
      return false;
    }
  }

  /**
   * Track screen views
   */
  async trackScreenView(
    screenName: string,
    properties?: Record<string, any>,
  ): Promise<boolean> {
    return this.trackEvent('screen_view', {
      screenName,
      ...properties,
    });
  }

  /**
   * Track user interactions
   */
  async trackInteraction(data: {
    action: string;
    element: string;
    screen: string;
    properties?: Record<string, any>;
  }): Promise<boolean> {
    return this.trackEvent('user_interaction', {
      action: data.action,
      element: data.element,
      screen: data.screen,
      ...data.properties,
    });
  }

  /**
   * Track performance metrics
   */
  async trackPerformance(data: {
    metric: string;
    value: number;
    unit: string;
    context?: Record<string, any>;
  }): Promise<boolean> {
    return this.trackEvent('performance_metric', {
      metric: data.metric,
      value: data.value,
      unit: data.unit,
      ...data.context,
    });
  }

  /**
   * Track feature usage
   */
  async trackFeatureUsage(
    feature: string,
    properties?: Record<string, any>,
  ): Promise<boolean> {
    return this.trackEvent('feature_used', {
      feature,
      ...properties,
    });
  }

  /**
   * Track user preferences changes
   */
  async trackPreferenceChange(data: {
    preference: string;
    oldValue: any;
    newValue: any;
  }): Promise<boolean> {
    return this.trackEvent('preference_changed', {
      preference: data.preference,
      oldValue: data.oldValue,
      newValue: data.newValue,
    });
  }

  /**
   * Track app crashes
   */
  async trackCrash(data: {
    error: Error;
    context?: Record<string, any>;
  }): Promise<boolean> {
    return this.trackError({
      errorType: 'crash',
      errorMessage: data.error.message,
      stackTrace: data.error.stack,
      context: data.context,
    });
  }

  /**
   * Track network requests
   */
  async trackNetworkRequest(data: {
    url: string;
    method: string;
    statusCode: number;
    duration: number;
    success: boolean;
  }): Promise<boolean> {
    return this.trackEvent('network_request', {
      url: data.url,
      method: data.method,
      statusCode: data.statusCode,
      duration: data.duration,
      success: data.success,
    });
  }

  /**
   * Get analytics summary
   */
  async getAnalyticsSummary(): Promise<{
    totalEvents: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    topEvents: Array<{ event: string; count: number }>;
    errorRate: number;
  } | null> {
    try {
      const response = await apiClient.get(`${ENDPOINTS.TRACK_USAGE}/summary`);

      if (!response.success) {
        return null;
      }

      return response.data as any;
    } catch (error) {
      console.error('Get analytics summary failed:', error);
      return null;
    }
  }

  /**
   * Export analytics data
   */
  async exportAnalyticsData(startDate: string, endDate: string): Promise<any> {
    try {
      const response = await apiClient.get(`${ENDPOINTS.TRACK_USAGE}/export`, {
        startDate,
        endDate,
      });

      if (!response.success) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Export analytics data failed:', error);
      return null;
    }
  }

  /**
   * Clear analytics data
   */
  async clearAnalyticsData(): Promise<boolean> {
    try {
      const response = await apiClient.delete(ENDPOINTS.TRACK_USAGE);
      return response.success;
    } catch (error) {
      console.error('Clear analytics data failed:', error);
      return false;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Start new session
   */
  startNewSession(): void {
    this.sessionId = this.generateSessionId();
    this.trackEvent('session_started');
  }

  /**
   * End current session
   */
  async endSession(): Promise<boolean> {
    const success = await this.trackEvent('session_ended');
    this.sessionId = this.generateSessionId();
    return success;
  }
}

// Export singleton instance
export const analyticsService = new Analytics();
export default analyticsService;

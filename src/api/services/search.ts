import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import type { ContentDetailsRequest, ContentDetailsResponse, SearchRequest, SearchResponse } from '../types';

export class Search {
  /**
   * Search for movies/shows
   */
  async searchContent(request: SearchRequest): Promise<SearchResponse> {
    try {
      const response = await apiClient.get<SearchResponse>(
        ENDPOINTS.SEARCH_VIDEOS,
        {
          q: request.query,
          type: request.type || 'all',
          limit: request.limit || 20,
          offset: request.offset || 0,
          ...request.filters,
        }
      );

      if (!response.success) {
        return {
          success: false,
          results: [],
          total: 0,
          page: 1,
          hasMore: false,
          error: response.error,
        };
      }

      return response.data as SearchResponse;
    } catch (error) {
      console.error('Search failed:', error);
      return {
        success: false,
        results: [],
        total: 0,
        page: 1,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  }

  /**
   * Search specifically for movies
   */
  async searchMovies(request: SearchRequest): Promise<SearchResponse> {
    return this.searchContent({ ...request, type: 'movie' });
  }

  /**
   * Search specifically for TV shows
   */
  async searchShows(request: SearchRequest): Promise<SearchResponse> {
    return this.searchContent({ ...request, type: 'show' });
  }


  /**
   * Get content details
   */
  async getContentDetails(request: ContentDetailsRequest): Promise<ContentDetailsResponse> {
    try {
      const endpoint = request.type === 'movie' 
        ? ENDPOINTS.MOVIE_DETAILS 
        : ENDPOINTS.SHOW_DETAILS;

      const response = await apiClient.get<ContentDetailsResponse>(
        `${endpoint}/${request.contentId}`,
        {
          includeSimilar: request.includeSimilar,
          includeTrailer: request.includeTrailer,
        }
      );

      if (!response.success) {
        return {
          success: false,
          error: response.error || 'Failed to get content details',
        };
      }

      return response.data as ContentDetailsResponse;
    } catch (error) {
      console.error('Get content details failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Details fetch failed',
      };
    }
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
    try {
      const response = await apiClient.get<{ suggestions: string[] }>(
        `${ENDPOINTS.SEARCH_VIDEOS}/suggestions`,
        { q: query, limit }
      );

      if (!response.success) {
        return [];
      }

      return response.data?.suggestions || [];
    } catch (error) {
      console.error('Get search suggestions failed:', error);
      return [];
    }
  }

  /**
   * Get search history
   */
  async getSearchHistory(limit: number = 10): Promise<string[]> {
    try {
      const response = await apiClient.get<{ history: string[] }>(
        `${ENDPOINTS.SEARCH_VIDEOS}/history`,
        { limit }
      );

      if (!response.success) {
        return [];
      }

      return response.data?.history || [];
    } catch (error) {
      console.error('Get search history failed:', error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<boolean> {
    try {
      const response = await apiClient.delete(`${ENDPOINTS.SEARCH_VIDEOS}/history`);
      return response.success;
    } catch (error) {
      console.error('Clear search history failed:', error);
      return false;
    }
  }

  /**
   * Get content by filters
   */
  async getContentByFilters(filters: {
    genres?: string[];
    year?: number;
    rating?: number;
    duration?: number;
    sortBy?: 'title' | 'year' | 'rating' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  }): Promise<SearchResponse> {
    try {
      const response = await apiClient.get<SearchResponse>(
        `${ENDPOINTS.SEARCH_VIDEOS}/filter`,
        filters
      );

      if (!response.success) {
        return {
          success: false,
          results: [],
          total: 0,
          page: 1,
          hasMore: false,
          error: response.error,
        };
      }

      return response.data as SearchResponse;
    } catch (error) {
      console.error('Filter content failed:', error);
      return {
        success: false,
        results: [],
        total: 0,
        page: 1,
        hasMore: false,
        error: error instanceof Error ? error.message : 'Filter failed',
      };
    }
  }
}

// Export singleton instance
export const searchService = new Search();
export default searchService; 
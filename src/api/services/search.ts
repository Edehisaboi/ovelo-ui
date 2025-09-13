import type { VideoResult } from '../../types';
import { apiClient } from '../client';
import { ENDPOINTS } from '../config';
import type {
  ContentDetailsRequest,
  ContentDetailsResponse,
  SearchRequest,
  SearchResponse,
} from '../types';

type ApiResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export class Search {
  /**
   * Return a standardized empty SearchResponse (for failures/fallbacks).
   */
  private emptySearchResponse(error?: string): SearchResponse {
    return {
      success: false,
      results: [],
      total: 0,
      page: 1,
      hasMore: false,
      error,
    };
  }

  /**
   * Convert unknown errors to readable messages.
   */
  private toMessage(err: unknown): string {
    return err instanceof Error ? err.message : 'Unexpected error';
  }

  /**
   * Deduplicate any array of items by `id` (order-preserving).
   */
  private uniqueById<T extends { id?: string | number }>(items: T[] = []): T[] {
    const seen = new Set<string | number>();
    const out: T[] = [];
    for (const item of items) {
      if (item.id && !seen.has(item.id)) {
        seen.add(item.id);
        out.push(item);
      }
    }
    return out;
  }

  /**
   * Normalize and dedupe a SearchResponse payload.
   * Preserve server-provided `total` when available.
   */
  private normalizeSearchData(data?: SearchResponse | null): SearchResponse {
    if (!data) return this.emptySearchResponse('No data received');

    const uniqueResults = this.uniqueById<VideoResult>(data.results ?? []);

    return {
      ...data,
      results: uniqueResults,
      total: data.total ?? uniqueResults.length,
      success: true,
    };
  }

  async searchContent(request: SearchRequest): Promise<SearchResponse> {
    try {
      const body = {
        query: request.query,
        type: request.type ?? 'all',
        limit: request.limit ?? 10,
      };

      const res = (await apiClient.post<SearchResponse>(
        ENDPOINTS.SEARCH_VIDEOS,
        body,
      )) as ApiResult<SearchResponse>;

      if (!res.success) {
        return this.emptySearchResponse(res.error || 'Search failed');
      }

      return this.normalizeSearchData(res.data);
    } catch (err) {
      console.error('Search failed:', err);
      return this.emptySearchResponse(this.toMessage(err));
    }
  }

  /**
   * Search specifically for movies.
   */
  async searchMovies(request: SearchRequest): Promise<SearchResponse> {
    return this.searchContent({ ...request, type: 'movie' });
  }

  /**
   * Search specifically for TV shows.
   */
  async searchShows(request: SearchRequest): Promise<SearchResponse> {
    return this.searchContent({ ...request, type: 'tv' });
  }

  /**
   * Get content details by ID and type.
   */
  async getContentDetails(
    request: ContentDetailsRequest,
  ): Promise<ContentDetailsResponse> {
    try {
      const endpoint =
        request.type === 'movie'
          ? ENDPOINTS.MOVIE_DETAILS
          : ENDPOINTS.SHOW_DETAILS;

      const res = (await apiClient.get<ContentDetailsResponse>(
        `${endpoint}/${request.contentId}`,
        {
          includeSimilar: request.includeSimilar,
          includeTrailer: request.includeTrailer,
        },
      )) as ApiResult<ContentDetailsResponse>;

      if (!res.success) {
        return {
          success: false,
          error: res.error || 'Failed to get content details',
        };
      }

      return res.data as ContentDetailsResponse;
    } catch (err) {
      console.error('Get content details failed:', err);
      return { success: false, error: this.toMessage(err) };
    }
  }

  /**
   * Get search suggestions/autocomplete.
   */
  async getSearchSuggestions(query: string, limit = 5): Promise<string[]> {
    try {
      const res = (await apiClient.get<{ suggestions: string[] }>(
        `${ENDPOINTS.SEARCH_VIDEOS}/suggestions`,
        { query, limit },
      )) as ApiResult<{ suggestions: string[] }>;

      if (!res.success) return [];
      return res.data?.suggestions ?? [];
    } catch (err) {
      console.error('Get search suggestions failed:', err);
      return [];
    }
  }

  /**
   * Get search history.
   */
  async getSearchHistory(limit = 10): Promise<string[]> {
    try {
      const res = (await apiClient.get<{ history: string[] }>(
        `${ENDPOINTS.SEARCH_VIDEOS}/history`,
        { limit },
      )) as ApiResult<{ history: string[] }>;

      if (!res.success) return [];
      return res.data?.history ?? [];
    } catch (err) {
      console.error('Get search history failed:', err);
      return [];
    }
  }

  /**
   * Clear search history.
   */
  async clearSearchHistory(): Promise<boolean> {
    try {
      const res = (await apiClient.delete(
        `${ENDPOINTS.SEARCH_VIDEOS}/history`,
      )) as ApiResult<unknown>;
      return !!res.success;
    } catch (err) {
      console.error('Clear search history failed:', err);
      return false;
    }
  }

  /**
   * Get content by filters.
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
      const res = (await apiClient.get<SearchResponse>(
        `${ENDPOINTS.SEARCH_VIDEOS}/filter`,
        filters,
      )) as ApiResult<SearchResponse>;

      if (!res.success) {
        return this.emptySearchResponse(res.error || 'Filter failed');
      }

      return this.normalizeSearchData(res.data);
    } catch (err) {
      console.error('Filter content failed:', err);
      return this.emptySearchResponse(this.toMessage(err));
    }
  }
}

// Export singleton instance
export const searchService = new Search();
export default searchService;

/**
 * Query Service
 * 
 * Handles searching images using text queries via the backend /query endpoint
 */

import axios from 'axios';
import CONFIG from '../config/environment';

// Backend server configuration
const BASE_URL = CONFIG.API_BASE_URL;

export interface ImageMetadata {
  id: string;
  filename: string;
  description: string;
  timestamp: string;
  uploadDate?: string;
  score?: number;
  // Future extensible fields
  faces?: any[];
  relationships?: any[];
  temporal_info?: any;
}

interface QueryResponse {
  success: boolean;
  message: string;
  data?: {
    query: string;
    results: ImageMetadata[];
    totalFound: number;
    searchParams: {
      limit: number;
      scoreThreshold: number;
    };
  };
}

interface QueryOptions {
  limit?: number;
  scoreThreshold?: number;
}

class QueryService {
  /**
   * Search images using text query
   * @param query - Text description to search for
   * @param options - Search options (limit, threshold)
   */
  async searchImages(
    query: string,
    options: QueryOptions = {}
  ): Promise<QueryResponse> {
    try {
      const { limit = 20, scoreThreshold = 0.7 } = options;

      console.log(`🔍 Searching for: "${query}"`);

      const response = await axios.post(`${BASE_URL}/api/query`, {
        query: query.trim(),
        limit,
        scoreThreshold,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds for AI processing
      });

      console.log(`✅ Search completed: found ${response.data.data?.totalFound || 0} results`);
      return response.data;
    } catch (error: any) {
      console.error(`❌ Search failed for query "${query}":`, error.message);
      
      if (error.response) {
        return {
          success: false,
          message: error.response.data?.message || 'Search failed',
        };
      }
      
      return {
        success: false,
        message: error.message || 'Network error during search',
      };
    }
  }

  /**
   * Get all images (useful for gallery display)
   * @param limit - Maximum number of images to fetch
   */
  async getAllImages(limit: number = 50): Promise<QueryResponse> {
    try {
      console.log(`📋 Fetching all images (limit: ${limit})`);

      // Use a very broad query to get all images
      return await this.searchImages('image photo picture', {
        limit,
        scoreThreshold: 0.1, // Very low threshold to get all images
      });
    } catch (error: any) {
      console.error('❌ Failed to fetch all images:', error.message);
      return {
        success: false,
        message: error.message || 'Failed to fetch images',
      };
    }
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats(): Promise<any> {
    try {
      console.log('📊 Fetching database statistics');

      const response = await axios.get(`${BASE_URL}/api/stats`, {
        timeout: 10000,
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Failed to fetch database stats:', error.message);
      return {
        success: false,
        message: error.message || 'Failed to fetch database statistics',
      };
    }
  }

  /**
   * Search with suggestions - provides alternative queries if no results
   * @param query - Original search query
   * @param options - Search options
   */
  async searchWithSuggestions(
    query: string,
    options: QueryOptions = {}
  ): Promise<QueryResponse & { suggestions?: string[] }> {
    const result = await this.searchImages(query, options);

    // If no results found, provide suggestions
    if (result.success && result.data?.totalFound === 0) {
      const suggestions = this.generateSearchSuggestions(query);
      return {
        ...result,
        suggestions,
      };
    }

    return result;
  }

  /**
   * Generate search suggestions based on common patterns
   * @param originalQuery - The original query that returned no results
   */
  private generateSearchSuggestions(originalQuery: string): string[] {
    const suggestions: string[] = [];
    const words = originalQuery.toLowerCase().split(' ');

    // Add broader terms
    suggestions.push('landscape');
    suggestions.push('people');
    suggestions.push('nature');
    suggestions.push('city');
    suggestions.push('sunset');
    suggestions.push('ocean');

    // Add variations of original words
    words.forEach(word => {
      if (word.length > 3) {
        suggestions.push(word);
      }
    });

    // Remove duplicates and limit to 5 suggestions
    return [...new Set(suggestions)].slice(0, 5);
  }

  /**
   * Validate query before sending
   * @param query - Query to validate
   */
  validateQuery(query: string): { valid: boolean; message?: string } {
    if (!query || query.trim().length === 0) {
      return {
        valid: false,
        message: 'Search query cannot be empty',
      };
    }

    if (query.trim().length < 2) {
      return {
        valid: false,
        message: 'Search query must be at least 2 characters long',
      };
    }

    if (query.length > 500) {
      return {
        valid: false,
        message: 'Search query is too long (maximum 500 characters)',
      };
    }

    return { valid: true };
  }
}

export default new QueryService();

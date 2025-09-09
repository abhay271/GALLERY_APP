/**
 * Local Image Cache Service
 * 
 * Provides 50 sample images with metadata stored locally
 * Images are served from Picsum API but metadata is cached for offline viewing
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CachedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  filename: string;
  description: string;
  cached: boolean;
  timestamp: string;
}

class LocalImageCacheService {
  private static CACHE_KEY = 'gallery_cached_images';
  private images: CachedImage[] = [];

  /**
   * 50 High-quality sample images with descriptions
   */
  private getSampleImageData(): Array<{description: string}> {
    return [
      // Nature & Landscapes (15 images)
      { description: 'Serene mountain lake surrounded by snow-capped peaks at sunrise' },
      { description: 'Dense forest with tall trees and sunlight filtering through leaves' },
      { description: 'Rolling green hills under a dramatic cloudy sky' },
      { description: 'Beautiful sunset over calm ocean waters with orange reflections' },
      { description: 'Desert landscape with sand dunes and clear blue sky' },
      { description: 'Tropical beach with palm trees and crystal clear water' },
      { description: 'Waterfall cascading down moss-covered rocks in a forest' },
      { description: 'Alpine meadow filled with colorful wildflowers' },
      { description: 'Rocky coastline with waves crashing against cliffs' },
      { description: 'Autumn forest with trees in brilliant red and gold colors' },
      { description: 'Snow-covered pine trees in a winter wonderland' },
      { description: 'River flowing through a peaceful valley with mountains' },
      { description: 'Cactus and desert plants in a southwestern landscape' },
      { description: 'Misty morning over a tranquil lake with reflections' },
      { description: 'Volcanic landscape with unique rock formations' },

      // Urban & Architecture (10 images)
      { description: 'Modern city skyline with skyscrapers and glass buildings' },
      { description: 'Historic European architecture with cobblestone streets' },
      { description: 'Busy street market with colorful vendors and crowds' },
      { description: 'Modern bridge spanning across a city river at night' },
      { description: 'Charming cafe with outdoor seating on a quiet street' },
      { description: 'Grand cathedral with Gothic architecture and stained glass' },
      { description: 'Industrial warehouse district converted to modern lofts' },
      { description: 'Rooftop garden overlooking a bustling metropolis' },
      { description: 'Historic lighthouse standing tall on coastal rocks' },
      { description: 'Modern art museum with contemporary geometric design' },

      // Animals & Wildlife (10 images)
      { description: 'Majestic eagle soaring through a clear blue sky' },
      { description: 'Cute kitten playing with a ball of yarn' },
      { description: 'Golden retriever running happily through a field' },
      { description: 'Colorful butterfly resting on a vibrant flower' },
      { description: 'Wild horses galloping across an open prairie' },
      { description: 'Dolphin jumping gracefully out of ocean waves' },
      { description: 'Wise owl perched on a tree branch at dusk' },
      { description: 'Giraffe stretching its neck to reach acacia leaves' },
      { description: 'School of tropical fish swimming in coral reef' },
      { description: 'Penguin colony gathered on Antarctic ice sheets' },

      // Food & Culinary (10 images)
      { description: 'Delicious pizza with fresh ingredients and melted cheese' },
      { description: 'Colorful fruit salad with berries and tropical fruits' },
      { description: 'Freshly baked bread loaves with golden crust' },
      { description: 'Steaming cup of coffee with latte art design' },
      { description: 'Gourmet burger with layers of fresh vegetables' },
      { description: 'Chocolate cake with rich frosting and decorations' },
      { description: 'Fresh sushi platter with variety of rolls' },
      { description: 'Farmers market with fresh organic vegetables' },
      { description: 'Ice cream sundae with multiple flavors and toppings' },
      { description: 'Wine tasting setup with glasses and cheese board' },

      // Miscellaneous (5 images)
      { description: 'Vintage bicycle parked against a colorful wall' },
      { description: 'Stack of books with reading glasses and warm lighting' },
      { description: 'Musical instruments arranged on a wooden table' },
      { description: 'Cozy fireplace with logs burning and warm glow' },
      { description: 'Hot air balloons floating over countryside landscape' },
    ];
  }

  /**
   * Generate sample images with Picsum URLs
   */
  async generateSampleImages(): Promise<CachedImage[]> {
    const sampleData = this.getSampleImageData();
    const timestamp = new Date().toISOString();
    
    return sampleData.map((data, index) => {
      const imageId = index + 1;
      return {
        id: `sample_${imageId}`,
        url: `https://picsum.photos/800/600?random=${imageId}`,
        thumbnailUrl: `https://picsum.photos/400/300?random=${imageId}`,
        filename: `sample_image_${imageId}.jpg`,
        description: data.description,
        cached: true,
        timestamp: timestamp,
      };
    });
  }

  /**
   * Cache sample images metadata locally
   */
  async cacheSampleImages(
    onProgress?: (completed: number, total: number) => void
  ): Promise<CachedImage[]> {
    try {
      console.log('📱 Generating 50 sample images for local cache...');

      const sampleImages = await this.generateSampleImages();
      
      // Simulate progress for UI feedback
      for (let i = 0; i <= 50; i++) {
        if (onProgress) {
          onProgress(i, 50);
        }
        // Small delay to show progress
        await new Promise<void>(resolve => setTimeout(resolve, 50));
      }

      // Store metadata in AsyncStorage
      await AsyncStorage.setItem(
        LocalImageCacheService.CACHE_KEY,
        JSON.stringify(sampleImages)
      );

      this.images = sampleImages;
      console.log('✅ 50 sample images cached successfully');
      
      return sampleImages;
    } catch (error) {
      console.error('❌ Failed to cache sample images:', error);
      throw error;
    }
  }

  /**
   * Load cached images from AsyncStorage
   */
  async getCachedImages(): Promise<CachedImage[]> {
    try {
      if (this.images.length > 0) {
        return this.images;
      }

      const cachedData = await AsyncStorage.getItem(LocalImageCacheService.CACHE_KEY);
      
      if (cachedData) {
        this.images = JSON.parse(cachedData);
        console.log(`📱 Loaded ${this.images.length} cached images from storage`);
        return this.images;
      }

      // No cached data, return empty array
      return [];
    } catch (error) {
      console.error('❌ Failed to load cached images:', error);
      return [];
    }
  }

  /**
   * Check if sample images are cached
   */
  async isCacheComplete(): Promise<boolean> {
    try {
      const cachedData = await AsyncStorage.getItem(LocalImageCacheService.CACHE_KEY);
      if (cachedData) {
        const images = JSON.parse(cachedData);
        return images.length === 50;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to check cache status:', error);
      return false;
    }
  }

  /**
   * Clear cached images
   */
  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(LocalImageCacheService.CACHE_KEY);
      this.images = [];
      console.log('🗑️ Image cache cleared');
    } catch (error) {
      console.error('❌ Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Get cache info
   */
  async getCacheInfo(): Promise<{
    totalImages: number;
    cacheComplete: boolean;
    lastUpdated?: string;
  }> {
    try {
      const images = await this.getCachedImages();
      return {
        totalImages: images.length,
        cacheComplete: images.length === 50,
        lastUpdated: images.length > 0 ? images[0].timestamp : undefined,
      };
    } catch (error) {
      return {
        totalImages: 0,
        cacheComplete: false,
      };
    }
  }

  /**
   * Refresh sample images (regenerate with new random Picsum URLs)
   */
  async refreshSampleImages(): Promise<CachedImage[]> {
    await this.clearCache();
    return await this.cacheSampleImages();
  }
}

// Export singleton instance
export const localImageCache = new LocalImageCacheService();
export default localImageCache;

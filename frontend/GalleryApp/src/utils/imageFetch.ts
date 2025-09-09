/**
 * Image Fetch Utility
 * 
 * Utilities for fetching random images from public APIs for initial bootstrap
 */

import axios from 'axios';

interface RandomImageOptions {
  width?: number;
  height?: number;
  category?: string;
}

class ImageFetchUtil {
  /**
   * Fetch random images from Lorem Picsum
   * @param count - Number of images to fetch
   * @param options - Image options (width, height)
   */
  async fetchRandomImagesFromPicsum(
    count: number = 50,
    options: RandomImageOptions = {}
  ): Promise<string[]> {
    const { width = 800, height = 600 } = options;
    const imageUrls: string[] = [];

    console.log(`🖼️ Fetching ${count} random images from Lorem Picsum`);

    for (let i = 0; i < count; i++) {
      // Generate random seed to ensure different images
      const seed = Math.floor(Math.random() * 1000) + i;
      const imageUrl = `https://picsum.photos/seed/${seed}/${width}/${height}`;
      imageUrls.push(imageUrl);
    }

    console.log(`✅ Generated ${imageUrls.length} image URLs`);
    return imageUrls;
  }

  /**
   * Fetch random images from Unsplash (requires API key in production)
   * @param count - Number of images to fetch
   * @param options - Image options
   */
  async fetchRandomImagesFromUnsplash(
    count: number = 50,
    options: RandomImageOptions = {}
  ): Promise<string[]> {
    const { width = 800, height = 600, category = 'nature' } = options;
    const imageUrls: string[] = [];

    console.log(`🖼️ Fetching ${count} random images from Unsplash`);

    try {
      // Note: In production, you'd need an Unsplash API key
      // For demo purposes, we'll use the basic random endpoint
      for (let i = 0; i < count; i++) {
        const imageUrl = `https://source.unsplash.com/${width}x${height}/?${category}&${i}`;
        imageUrls.push(imageUrl);
      }

      console.log(`✅ Generated ${imageUrls.length} Unsplash URLs`);
      return imageUrls;
    } catch (error) {
      console.error('❌ Failed to fetch from Unsplash:', error);
      // Fallback to Lorem Picsum
      return this.fetchRandomImagesFromPicsum(count, options);
    }
  }

  /**
   * Download and convert image URL to local file
   * @param imageUrl - URL of the image to download
   * @param filename - Local filename to save as
   */
  async downloadImageToLocal(imageUrl: string, filename: string): Promise<string | null> {
    try {
      console.log(`⬇️ Downloading image: ${filename}`);

      const response = await axios.get(imageUrl, {
        responseType: 'blob',
        timeout: 10000,
      });

      // In React Native, you'd typically use react-native-fs to save files
      // For now, we'll return the blob URL which can be used directly
      const blob = new Blob([response.data]);
      const blobUrl = URL.createObjectURL(blob);

      console.log(`✅ Downloaded: ${filename}`);
      return blobUrl;
    } catch (error) {
      console.error(`❌ Failed to download ${filename}:`, error);
      return null;
    }
  }

  /**
   * Validate image URL
   * @param imageUrl - URL to validate
   */
  async validateImageUrl(imageUrl: string): Promise<boolean> {
    try {
      const response = await axios.head(imageUrl, { timeout: 5000 });
      const contentType = response.headers['content-type'];
      return contentType && contentType.startsWith('image/');
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate metadata for bootstrap images
   * @param imageUrls - Array of image URLs
   */
  generateBootstrapMetadata(imageUrls: string[]): Array<{
    uri: string;
    filename: string;
    timestamp: string;
  }> {
    return imageUrls.map((url, index) => ({
      uri: url,
      filename: `bootstrap_image_${index + 1}.jpg`,
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Get image categories for diverse bootstrap content
   */
  getImageCategories(): string[] {
    return [
      'nature',
      'landscape',
      'city',
      'people',
      'food',
      'animals',
      'technology',
      'art',
      'travel',
      'architecture',
      'sunset',
      'ocean',
      'mountains',
      'flowers',
      'abstract',
    ];
  }

  /**
   * Fetch diverse images across multiple categories
   * @param totalCount - Total number of images to fetch
   */
  async fetchDiverseImages(totalCount: number = 50): Promise<string[]> {
    const categories = this.getImageCategories();
    const imagesPerCategory = Math.ceil(totalCount / categories.length);
    const allImageUrls: string[] = [];

    console.log(`🎨 Fetching diverse images across ${categories.length} categories`);

    for (const category of categories) {
      try {
        const categoryImages = await this.fetchRandomImagesFromUnsplash(
          imagesPerCategory,
          { category }
        );
        allImageUrls.push(...categoryImages);

        // Break if we have enough images
        if (allImageUrls.length >= totalCount) {
          break;
        }
      } catch (error) {
        console.error(`❌ Failed to fetch images for category ${category}:`, error);
      }
    }

    // Shuffle the array to mix categories
    const shuffled = allImageUrls.sort(() => Math.random() - 0.5);
    
    // Return only the requested count
    return shuffled.slice(0, totalCount);
  }
}

export default new ImageFetchUtil();

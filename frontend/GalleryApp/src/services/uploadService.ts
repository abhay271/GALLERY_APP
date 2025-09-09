/**
 * Upload Service
 * 
 * Handles uploading images to the backend /upload endpoint
 * Supports both single and multiple image uploads
 */

import axios from 'axios';
import CONFIG from '../config/environment';

// Backend server configuration
const BASE_URL = CONFIG.API_BASE_URL;

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class UploadService {
  /**
   * Upload a single image file
   * @param imageUri - Local file path or URI
   * @param filename - Name for the uploaded file
   * @param onProgress - Progress callback function
   */
  async uploadImage(
    imageUri: string,
    filename: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    try {
      console.log(`📤 Uploading image: ${filename}`);

      // Create FormData for multipart upload
      const formData = new FormData();
      
      // For React Native, append file as object
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg', // Default to JPEG, could be determined from file extension
        name: filename,
      } as any);

      // Make upload request
      const response = await axios.post(`${BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            onProgress(progress);
          }
        },
      });

      console.log(`✅ Successfully uploaded: ${filename}`);
      return {
        success: true,
        message: 'Image uploaded successfully',
        data: response.data,
      };

    } catch (error: any) {
      console.error(`❌ Failed to upload ${filename}:`, error.message);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Upload failed',
      };
    }
  }

  /**
   * Upload multiple images
   * @param images - Array of {uri, filename} objects
   * @param onProgress - Progress callback for overall progress
   */
  async uploadMultipleImages(
    images: Array<{ uri: string; filename: string }>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<{ successful: UploadResponse[]; failed: UploadResponse[] }> {
    console.log(`📤 Starting upload of ${images.length} images`);

    const successful: UploadResponse[] = [];
    const failed: UploadResponse[] = [];

    for (let i = 0; i < images.length; i++) {
      const { uri, filename } = images[i];
      
      const result = await this.uploadImage(uri, filename);
      
      if (result.success) {
        successful.push(result);
      } else {
        failed.push(result);
      }

      // Update progress
      if (onProgress) {
        onProgress(i + 1, images.length);
      }
    }

    console.log(`📊 Upload completed: ${successful.length} successful, ${failed.length} failed`);
    return { successful, failed };
  }

  /**
   * Upload images from URLs (for initial bootstrap with sample images)
   * @param imageUrls - Array of image URLs
   * @param onProgress - Progress callback
   */
  async uploadImagesFromUrls(
    imageUrls: string[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<{ successful: UploadResponse[]; failed: UploadResponse[] }> {
    console.log(`📤 Uploading ${imageUrls.length} images from URLs`);

    const successful: UploadResponse[] = [];
    const failed: UploadResponse[] = [];

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      
      try {
        // For URL-based uploads, send URL to backend for processing
        const response = await axios.post(`${BASE_URL}/upload`, {
          imageUrl: imageUrl,
          filename: `bootstrap_image_${i + 1}.jpg`,
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        successful.push({
          success: true,
          message: 'Image uploaded successfully',
          data: response.data,
        });
        console.log(`✅ Uploaded bootstrap image ${i + 1}/${imageUrls.length}`);
      } catch (error: any) {
        console.error(`❌ Failed to upload image ${i + 1}:`, error.message);
        failed.push({
          success: false,
          message: `Failed to upload image ${i + 1}: ${error.message}`,
        });
      }

      // Update progress
      if (onProgress) {
        onProgress(i + 1, imageUrls.length);
      }
    }

    return { successful, failed };
  }

  /**
   * Check if backend is reachable
   */
  async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${BASE_URL}/api/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const uploadService = new UploadService();
export default uploadService;

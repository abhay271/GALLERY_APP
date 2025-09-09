/**
 * Custom Hooks for Gallery App
 * 
 * Collection of custom hooks for various gallery functionalities
 */

import { useState, useEffect, useCallback } from 'react';
import { useGallery, galleryActions } from '../context/GalleryContext';
import uploadService, { UploadProgress } from '../services/uploadService';
import queryService from '../services/queryService';
import localImageCache from '../services/localImageCache';
import imageFetchUtil from '../utils/imageFetch';

/**
 * Hook for handling bootstrap process
 */
export const useBootstrap = () => {
  const { state, dispatch } = useGallery();
  const [isBootstrapping, setIsBootstrapping] = useState(false);

  const performBootstrap = useCallback(async () => {
    if (state.isBootstrapComplete || isBootstrapping) {
      return;
    }

    try {
      setIsBootstrapping(true);
      dispatch(galleryActions.setUploading(true));

      console.log('🚀 Starting bootstrap process...');

      // Check if backend is reachable
      const isBackendHealthy = await uploadService.checkBackendHealth();
      if (!isBackendHealthy) {
        throw new Error('Backend is not reachable. Please ensure the server is running.');
      }

      // Fetch random images
      console.log('📥 Fetching random images...');
      const imageUrls = await imageFetchUtil.fetchDiverseImages(50);

      // Upload images to backend
      console.log('📤 Uploading bootstrap images...');
      const uploadResult = await uploadService.uploadImagesFromUrls(
        imageUrls,
        (completed: number, total: number) => {
          dispatch(galleryActions.setUploadProgress(completed, total));
        }
      );

      console.log(`✅ Bootstrap complete: ${uploadResult.successful.length} uploaded, ${uploadResult.failed.length} failed`);

      // Mark bootstrap as complete
      dispatch(galleryActions.setBootstrapComplete(true));

      // Load initial gallery
      await loadGalleryImages();

    } catch (error: any) {
      console.error('❌ Bootstrap failed:', error);
      dispatch(galleryActions.setError(error.message || 'Bootstrap failed'));
    } finally {
      setIsBootstrapping(false);
      dispatch(galleryActions.setUploading(false));
      dispatch(galleryActions.setUploadProgress(0, 0));
    }
  }, [state.isBootstrapComplete, isBootstrapping, dispatch]);

  const loadGalleryImages = useCallback(async () => {
    try {
      dispatch(galleryActions.setLoading(true));
      const result = await queryService.getAllImages(100);
      
      if (result.success && result.data) {
        dispatch(galleryActions.setImages(result.data.results));
      } else {
        dispatch(galleryActions.setError(result.message || 'Failed to load images'));
      }
    } catch (error: any) {
      dispatch(galleryActions.setError(error.message || 'Failed to load images'));
    } finally {
      dispatch(galleryActions.setLoading(false));
    }
  }, [dispatch]);

  return {
    performBootstrap,
    loadGalleryImages,
    isBootstrapping,
    isBootstrapComplete: state.isBootstrapComplete,
  };
};

/**
 * Hook for handling image search
 */
export const useImageSearch = () => {
  const { state, dispatch } = useGallery();
  const [isSearching, setIsSearching] = useState(false);

  const searchImages = useCallback(async (query: string) => {
    if (!query.trim()) {
      return;
    }

    try {
      setIsSearching(true);
      dispatch(galleryActions.setLoading(true));
      dispatch(galleryActions.setSearchQuery(query));

      console.log(`🔍 Searching for: "${query}"`);

      const result = await queryService.searchWithSuggestions(query, {
        limit: 50,
        scoreThreshold: 0.6,
      });

      if (result.success && result.data) {
        dispatch(galleryActions.setSearchResults(result.data.results));
        
        if (result.data.totalFound === 0) {
          dispatch(galleryActions.setError(`No images found for "${query}". Try different keywords.`));
        }
      } else {
        dispatch(galleryActions.setError(result.message || 'Search failed'));
      }
    } catch (error: any) {
      console.error('❌ Search failed:', error);
      dispatch(galleryActions.setError(error.message || 'Search failed'));
    } finally {
      setIsSearching(false);
      dispatch(galleryActions.setLoading(false));
    }
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch(galleryActions.clearSearch());
  }, [dispatch]);

  return {
    searchImages,
    clearSearch,
    isSearching,
    searchResults: state.searchResults,
    searchQuery: state.searchQuery,
  };
};

/**
 * Hook for handling image uploads
 */
export const useImageUpload = () => {
  const { dispatch } = useGallery();
  const [isUploading, setIsUploading] = useState(false);

  const uploadImages = useCallback(async (
    images: Array<{ uri: string; filename: string }>
  ) => {
    try {
      setIsUploading(true);
      dispatch(galleryActions.setUploading(true));

      console.log(`📤 Uploading ${images.length} images...`);

      const result = await uploadService.uploadMultipleImages(
        images,
        (completed: number, total: number) => {
          dispatch(galleryActions.setUploadProgress(completed, total));
        }
      );

      if (result.successful.length > 0) {
        console.log(`✅ Upload successful: ${result.successful.length} images`);
        // Refresh gallery after upload
        const galleryResult = await queryService.getAllImages(100);
        if (galleryResult.success && galleryResult.data) {
          dispatch(galleryActions.setImages(galleryResult.data.results));
        }
      }

      if (result.failed.length > 0) {
        console.warn(`⚠️ Upload partially failed: ${result.failed.length} images failed`);
        dispatch(galleryActions.setError(`${result.failed.length} images failed to upload`));
      }

      return result;
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      dispatch(galleryActions.setError(error.message || 'Upload failed'));
      throw error;
    } finally {
      setIsUploading(false);
      dispatch(galleryActions.setUploading(false));
      dispatch(galleryActions.setUploadProgress(0, 0));
    }
  }, [dispatch]);

  const uploadSingleImage = useCallback(async (
    imageUri: string,
    filename: string
  ) => {
    try {
      setIsUploading(true);
      dispatch(galleryActions.setUploading(true));

      const result = await uploadService.uploadImage(
        imageUri,
        filename,
        (progress: UploadProgress) => {
          dispatch(galleryActions.setUploadProgress(progress.loaded, progress.total));
        }
      );

      if (result.success) {
        // Refresh gallery after upload
        const galleryResult = await queryService.getAllImages(100);
        if (galleryResult.success && galleryResult.data) {
          dispatch(galleryActions.setImages(galleryResult.data.results));
        }
      } else {
        dispatch(galleryActions.setError(result.message || 'Upload failed'));
      }

      return result;
    } catch (error: any) {
      console.error('❌ Single upload failed:', error);
      dispatch(galleryActions.setError(error.message || 'Upload failed'));
      throw error;
    } finally {
      setIsUploading(false);
      dispatch(galleryActions.setUploading(false));
      dispatch(galleryActions.setUploadProgress(0, 0));
    }
  }, [dispatch]);

  return {
    uploadImages,
    uploadSingleImage,
    isUploading,
  };
};

/**
 * Hook for error handling
 */
export const useErrorHandler = () => {
  const { state, dispatch } = useGallery();

  const clearError = useCallback(() => {
    dispatch(galleryActions.clearError());
  }, [dispatch]);

  const setError = useCallback((error: string) => {
    dispatch(galleryActions.setError(error));
  }, [dispatch]);

  return {
    error: state.error,
    clearError,
    setError,
  };
};

/**
 * Hook for gallery statistics
 */
export const useGalleryStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await queryService.getDatabaseStats();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    isLoading,
    loadStats,
  };
};

/**
 * Hook for local image caching
 */
export const useLocalImageCache = () => {
  const { state, dispatch } = useGallery();
  const [isCaching, setIsCaching] = useState(false);
  const [cacheComplete, setCacheComplete] = useState(false);

  const downloadAndCacheImages = useCallback(async () => {
    if (isCaching || cacheComplete) {
      return;
    }

    try {
      setIsCaching(true);
      dispatch(galleryActions.setLoading(true));

      console.log('� Starting local image cache generation...');

      // Check if cache is already complete
      const isComplete = await localImageCache.isCacheComplete();
      if (isComplete) {
        console.log('✅ Cache already complete');
        const cachedImages = await localImageCache.getCachedImages();
        dispatch(galleryActions.setCachedImages(cachedImages));
        setCacheComplete(true);
        return;
      }

      // Generate and cache sample images with progress
      const cachedImages = await localImageCache.cacheSampleImages(
        (completed: number, total: number) => {
          dispatch(galleryActions.setCacheProgress(completed, total));
        }
      );

      dispatch(galleryActions.setCachedImages(cachedImages));
      setCacheComplete(true);

      console.log(`✅ Local cache complete: 50 sample images ready`);

    } catch (error: any) {
      console.error('❌ Local cache failed:', error);
      dispatch(galleryActions.setError(error.message || 'Failed to setup sample images'));
    } finally {
      setIsCaching(false);
      dispatch(galleryActions.setLoading(false));
    }
  }, [dispatch, isCaching, cacheComplete]);

  const loadCachedImages = useCallback(async () => {
    try {
      const cachedImages = await localImageCache.getCachedImages();
      dispatch(galleryActions.setCachedImages(cachedImages));
      
      const isComplete = await localImageCache.isCacheComplete();
      setCacheComplete(isComplete);
      
      return cachedImages;
    } catch (error: any) {
      console.error('❌ Failed to load cached images:', error);
      return [];
    }
  }, [dispatch]);

  const clearCache = useCallback(async () => {
    try {
      await localImageCache.clearCache();
      dispatch(galleryActions.setCachedImages([]));
      setCacheComplete(false);
      console.log('🗑️ Local cache cleared');
    } catch (error: any) {
      console.error('❌ Failed to clear cache:', error);
    }
  }, [dispatch]);

  const getCacheSize = useCallback(async () => {
    try {
      const cacheInfo = await localImageCache.getCacheInfo();
      return cacheInfo.totalImages; // Return number of images instead of MB
    } catch (error) {
      return 0;
    }
  }, []);

  return {
    cachedImages: state.cachedImages,
    isCaching,
    cacheComplete,
    downloadAndCacheImages,
    loadCachedImages,
    clearCache,
    getCacheSize,
  };
};

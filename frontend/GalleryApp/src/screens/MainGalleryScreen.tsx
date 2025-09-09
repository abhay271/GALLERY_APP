/**
 * MainGalleryScreen
 * 
 * Main screen that displays the gallery with search functionality
 * Handles bootstrap, search, and image display
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import { useGallery } from '../context/GalleryContext';
import { useBootstrap, useImageSearch, useErrorHandler, useLocalImageCache } from '../hooks/useGallery';
import GalleryGrid from '../components/GalleryGrid';
import SearchBar from '../components/SearchBar';
import LoadingOverlay from '../components/LoadingOverlay';
import { ImageMetadata } from '../services/queryService';

export const MainGalleryScreen: React.FC = () => {
  const { state } = useGallery();
  const { performBootstrap, loadGalleryImages, isBootstrapping } = useBootstrap();
  const { searchImages, clearSearch, isSearching, searchResults, searchQuery } = useImageSearch();
  const { error, clearError } = useErrorHandler();
  const { 
    cachedImages, 
    isCaching, 
    cacheComplete, 
    downloadAndCacheImages, 
    loadCachedImages 
  } = useLocalImageCache();
  
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Load cached images on app start
  useEffect(() => {
    loadCachedImages();
  }, [loadCachedImages]);

  // Download and cache images if not complete
  useEffect(() => {
    if (!cacheComplete && !isCaching) {
      downloadAndCacheImages();
    }
  }, [cacheComplete, isCaching, downloadAndCacheImages]);

  // Handle bootstrap on first launch (for backend integration)
  useEffect(() => {
    if (!state.isBootstrapComplete && !isBootstrapping && cacheComplete) {
      // Only perform bootstrap after local cache is complete
      performBootstrap();
    } else if (state.isBootstrapComplete && state.images.length === 0) {
      loadGalleryImages();
    }
  }, [state.isBootstrapComplete, isBootstrapping, performBootstrap, loadGalleryImages, state.images.length, cacheComplete]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    searchImages(query);
    setShowSearchResults(true);
  }, [searchImages]);

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    clearSearch();
    setShowSearchResults(false);
  }, [clearSearch]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    if (showSearchResults && searchQuery) {
      searchImages(searchQuery);
    } else {
      loadGalleryImages();
    }
  }, [showSearchResults, searchQuery, searchImages, loadGalleryImages]);

  // Handle image press
  const handleImagePress = useCallback((image: ImageMetadata) => {
    // Image modal is handled by ImageCard component
    console.log('Image pressed:', image.filename);
  }, []);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Error',
        error,
        [
          { text: 'OK', onPress: clearError },
        ]
      );
    }
  }, [error, clearError]);

  // Determine which images to display
  const displayImages = (() => {
    if (showSearchResults) {
      return searchResults;
    }
    
    // If we have backend images, show them
    if (state.images.length > 0) {
      return state.images;
    }
    
    // Otherwise show cached images converted to ImageMetadata format
    return cachedImages
      .filter(img => img.cached)
      .map(img => ({
        id: img.id,
        filename: img.filename,
        description: img.description,
        timestamp: img.timestamp,
        url: img.url, // Use Picsum URL
        thumbnailUrl: img.thumbnailUrl,
      }));
  })();

  // Determine loading state
  const isLoading = state.isLoading || isSearching || isCaching;

  // Determine empty message
  const getEmptyMessage = () => {
    if (showSearchResults) {
      return searchQuery 
        ? `No images found for "${searchQuery}"`
        : 'Enter a search query to find images';
    }
    
    if (isCaching) {
      return 'Downloading images to your device...';
    }
    
    if (!state.isBootstrapComplete) {
      return 'Setting up your gallery...';
    }
    
    return 'No images in gallery';
  };

  // Search suggestions
  const searchSuggestions = [
    'landscape',
    'people',
    'nature',
    'city',
    'sunset',
    'ocean',
    'mountains',
    'flowers',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
        backgroundColor="#fff"
      />
      
      <View style={styles.content}>
        {/* Search Bar */}
        <SearchBar
          onSearch={handleSearch}
          onClear={handleClearSearch}
          placeholder="Search your gallery..."
          initialValue={searchQuery}
          suggestions={searchSuggestions}
          isLoading={isSearching}
        />

        {/* Gallery Grid */}
        <GalleryGrid
          images={displayImages}
          onRefresh={handleRefresh}
          refreshing={isLoading}
          onImagePress={handleImagePress}
          emptyMessage={getEmptyMessage()}
          showGridSizeControls={!showSearchResults}
        />
      </View>

      {/* Loading Overlays */}
      <LoadingOverlay
        visible={isBootstrapping}
        type="bootstrapping"
        message="Setting up your gallery with sample images"
        progress={state.uploadProgress}
      />

      <LoadingOverlay
        visible={state.isUploading && !isBootstrapping}
        type="uploading"
        message="Processing and uploading images"
        progress={state.uploadProgress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
});

export default MainGalleryScreen;

/**
 * GalleryGrid Component
 * 
 * Grid layout component for displaying images in a gallery format
 * Supports different grid sizes and layouts
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import ImageCard from './ImageCard';
import { ImageMetadata } from '../services/queryService';

interface GalleryGridProps {
  images: ImageMetadata[];
  onRefresh?: () => void;
  refreshing?: boolean;
  onImagePress?: (image: ImageMetadata) => void;
  emptyMessage?: string;
  gridSize?: 2 | 3 | 4;
  showGridSizeControls?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const GalleryGrid: React.FC<GalleryGridProps> = ({
  images,
  onRefresh,
  refreshing = false,
  onImagePress,
  emptyMessage = 'No images found',
  gridSize: initialGridSize = 2,
  showGridSizeControls = false,
}) => {
  const [gridSize, setGridSize] = useState(initialGridSize);

  const getImageSize = () => {
    switch (gridSize) {
      case 3:
        return 'small';
      case 4:
        return 'small';
      default:
        return 'medium';
    }
  };

  const renderImageCard = useCallback(({ item }: { item: ImageMetadata }) => (
    <ImageCard
      image={item}
      onPress={onImagePress}
      size={getImageSize()}
      showMetadata={gridSize <= 2}
    />
  ), [onImagePress, gridSize]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📷</Text>
      <Text style={styles.emptyText}>{emptyMessage}</Text>
      <Text style={styles.emptySubtext}>
        {images.length === 0 
          ? 'Upload some images or try searching for different terms'
          : 'Try adjusting your search query'
        }
      </Text>
    </View>
  );

  const renderGridSizeControls = () => {
    if (!showGridSizeControls) return null;

    return (
      <View style={styles.gridControls}>
        <Text style={styles.gridControlsLabel}>Grid Size:</Text>
        {[2, 3, 4].map((size) => (
          <TouchableOpacity
            key={size}
            style={[
              styles.gridSizeButton,
              gridSize === size && styles.gridSizeButtonActive,
            ]}
            onPress={() => setGridSize(size as 2 | 3 | 4)}
          >
            <Text
              style={[
                styles.gridSizeButtonText,
                gridSize === size && styles.gridSizeButtonTextActive,
              ]}
            >
              {size}x{size}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const getItemLayout = useCallback((data: any, index: number) => {
    const itemSize = screenWidth / gridSize;
    return {
      length: itemSize,
      offset: itemSize * index,
      index,
    };
  }, [gridSize]);

  const keyExtractor = useCallback((item: ImageMetadata, index: number) => 
    item.id || item.filename || index.toString()
  , []);

  return (
    <View style={styles.container}>
      {renderGridSizeControls()}
      
      <FlatList
        data={images}
        renderItem={renderImageCard}
        keyExtractor={keyExtractor}
        numColumns={gridSize}
        key={`grid-${gridSize}`} // Force re-render when grid size changes
        contentContainerStyle={styles.gridContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#007AFF']}
              tintColor="#007AFF"
            />
          ) : undefined
        }
        ListEmptyComponent={renderEmpty}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={20}
        // Performance optimizations
        legacyImplementation={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  gridContainer: {
    padding: 4,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  gridControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  gridControlsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 12,
  },
  gridSizeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gridSizeButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  gridSizeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  gridSizeButtonTextActive: {
    color: '#fff',
  },
});

export default GalleryGrid;

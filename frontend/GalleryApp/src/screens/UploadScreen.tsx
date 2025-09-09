/**
 * UploadScreen
 * 
 * Screen for manually uploading images from device gallery
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { launchImageLibrary, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import { useImageUpload, useErrorHandler } from '../hooks/useGallery';
import LoadingOverlay from '../components/LoadingOverlay';

interface SelectedImage {
  uri: string;
  filename: string;
  fileSize?: number;
  type?: string;
}

const { width: screenWidth } = Dimensions.get('window');
const IMAGE_SIZE = (screenWidth - 48) / 3; // 3 images per row with margins

export const UploadScreen: React.FC = () => {
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const { uploadImages, isUploading } = useImageUpload();
  const { error, clearError } = useErrorHandler();

  const selectImages = useCallback(() => {
    const options = {
      mediaType: 'photo' as MediaType,
      selectionLimit: 10, // Allow multiple selection
      includeBase64: false,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel) {
        return;
      }

      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
        return;
      }

      if (response.assets && response.assets.length > 0) {
        const newImages: SelectedImage[] = response.assets.map((asset, index) => ({
          uri: asset.uri || '',
          filename: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          fileSize: asset.fileSize,
          type: asset.type,
        }));

        setSelectedImages(prev => [...prev, ...newImages]);
      }
    });
  }, []);

  const removeImage = useCallback((index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedImages([]);
  }, []);

  const handleUpload = useCallback(async () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images', 'Please select images to upload');
      return;
    }

    try {
      await uploadImages(selectedImages);
      
      Alert.alert(
        'Upload Complete',
        `Successfully uploaded ${selectedImages.length} images`,
        [
          { 
            text: 'OK', 
            onPress: () => setSelectedImages([]) 
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Failed to upload images');
    }
  }, [selectedImages, uploadImages]);

  const renderImageItem = ({ item, index }: { item: SelectedImage; index: number }) => (
    <View style={styles.imageItem}>
      <Image source={{ uri: item.uri }} style={styles.selectedImage} />
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeImage(index)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.imageFilename} numberOfLines={1}>
        {item.filename}
      </Text>
      {item.fileSize && (
        <Text style={styles.imageSize}>
          {(item.fileSize / 1024 / 1024).toFixed(1)} MB
        </Text>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📷</Text>
      <Text style={styles.emptyTitle}>No Images Selected</Text>
      <Text style={styles.emptySubtitle}>
        Tap the button below to select images from your gallery
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upload Images</Text>
        <Text style={styles.subtitle}>
          Select images from your gallery to upload
        </Text>
      </View>

      <View style={styles.content}>
        {selectedImages.length > 0 ? (
          <>
            <View style={styles.selectionHeader}>
              <Text style={styles.selectionCount}>
                {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
              </Text>
              <TouchableOpacity onPress={clearSelection}>
                <Text style={styles.clearButton}>Clear All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectedImages}
              renderItem={renderImageItem}
              keyExtractor={(item, index) => `${item.uri}-${index}`}
              numColumns={3}
              contentContainerStyle={styles.imageGrid}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          renderEmptyState()
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={selectImages}
          disabled={isUploading}
        >
          <Text style={styles.selectButtonText}>
            📁 Select Images
          </Text>
        </TouchableOpacity>

        {selectedImages.length > 0 && (
          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={isUploading}
          >
            <Text style={[styles.uploadButtonText, isUploading && styles.uploadButtonTextDisabled]}>
              {isUploading ? '⏳ Uploading...' : `📤 Upload ${selectedImages.length} Image${selectedImages.length !== 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <LoadingOverlay
        visible={isUploading}
        type="uploading"
        message="Processing and uploading images to gallery"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  clearButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  imageGrid: {
    padding: 8,
  },
  imageItem: {
    width: IMAGE_SIZE,
    margin: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedImage: {
    width: '100%',
    height: IMAGE_SIZE,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageFilename: {
    fontSize: 10,
    color: '#333',
    padding: 4,
    fontWeight: '500',
  },
  imageSize: {
    fontSize: 8,
    color: '#666',
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButtonTextDisabled: {
    color: '#999',
  },
});

export default UploadScreen;

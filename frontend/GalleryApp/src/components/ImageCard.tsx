/**
 * ImageCard Component
 * 
 * Reusable component for displaying image metadata in a card format
 * Designed to be extensible for future metadata like faces, relationships, etc.
 */

import React, { useState } from 'react';
import {
  View,
  Image,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { ImageMetadata } from '../services/queryService';

interface ImageCardProps {
  image: ImageMetadata;
  onPress?: (image: ImageMetadata) => void;
  size?: 'small' | 'medium' | 'large';
  showMetadata?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_MARGIN = 4;

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  onPress,
  size = 'medium',
  showMetadata = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Calculate card dimensions based on size and screen width
  const getCardDimensions = () => {
    const availableWidth = screenWidth - (CARD_MARGIN * 6); // Account for margins
    
    switch (size) {
      case 'small':
        return {
          width: availableWidth / 3 - CARD_MARGIN,
          height: availableWidth / 3 - CARD_MARGIN,
        };
      case 'large':
        return {
          width: availableWidth - CARD_MARGIN,
          height: availableWidth - CARD_MARGIN,
        };
      default: // medium
        return {
          width: availableWidth / 2 - CARD_MARGIN,
          height: availableWidth / 2 - CARD_MARGIN,
        };
    }
  };

  const cardDimensions = getCardDimensions();

  const handlePress = () => {
    if (onPress) {
      onPress(image);
    } else {
      setShowModal(true);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return timestamp;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Generate image source URL
  const getImageSource = () => {
    // If image has a direct URL, use it
    if (image.filename && image.filename.startsWith('http')) {
      return { uri: image.filename };
    }
    
    // For bootstrap images or other cases, construct placeholder
    return { 
      uri: `https://picsum.photos/seed/${image.id || image.filename}/${Math.floor(cardDimensions.width)}/${Math.floor(cardDimensions.height)}`
    };
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { 
          width: cardDimensions.width, 
          height: cardDimensions.height + (showMetadata ? 60 : 0) 
        }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={[styles.imageContainer, { 
          width: cardDimensions.width, 
          height: cardDimensions.height 
        }]}>
          {!imageError ? (
            <Image
              source={getImageSource()}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>📷</Text>
              <Text style={styles.errorTextSmall}>Image not available</Text>
            </View>
          )}
          
          {/* Score overlay for search results */}
          {image.score && (
            <View style={styles.scoreOverlay}>
              <Text style={styles.scoreText}>
                {Math.round(image.score * 100)}%
              </Text>
            </View>
          )}
        </View>

        {showMetadata && (
          <View style={styles.metadataContainer}>
            <Text style={styles.filename} numberOfLines={1}>
              {truncateText(image.filename || 'Unknown', 20)}
            </Text>
            <Text style={styles.timestamp} numberOfLines={1}>
              {formatTimestamp(image.timestamp || '')}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Full-screen modal for detailed view */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalClose}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalContent}>
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <Image
                  source={getImageSource()}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
                
                <View style={styles.modalMetadata}>
                  <Text style={styles.modalTitle}>Image Details</Text>
                  
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Filename:</Text>
                    <Text style={styles.metadataValue}>{image.filename}</Text>
                  </View>
                  
                  <View style={styles.metadataRow}>
                    <Text style={styles.metadataLabel}>Timestamp:</Text>
                    <Text style={styles.metadataValue}>
                      {formatTimestamp(image.timestamp || '')}
                    </Text>
                  </View>
                  
                  {image.description && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>Description:</Text>
                      <Text style={styles.metadataValue}>{image.description}</Text>
                    </View>
                  )}
                  
                  {image.score && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>Match Score:</Text>
                      <Text style={styles.metadataValue}>
                        {Math.round(image.score * 100)}%
                      </Text>
                    </View>
                  )}

                  {/* Placeholder for future extensible metadata */}
                  {image.faces && image.faces.length > 0 && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>Faces Detected:</Text>
                      <Text style={styles.metadataValue}>{image.faces.length}</Text>
                    </View>
                  )}

                  {image.relationships && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>Relationships:</Text>
                      <Text style={styles.metadataValue}>
                        {JSON.stringify(image.relationships)}
                      </Text>
                    </View>
                  )}

                  {image.temporal_info && (
                    <View style={styles.metadataRow}>
                      <Text style={styles.metadataLabel}>Temporal Info:</Text>
                      <Text style={styles.metadataValue}>
                        {JSON.stringify(image.temporal_info)}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: CARD_MARGIN,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 24,
    marginBottom: 4,
  },
  errorTextSmall: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  scoreOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  scoreText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  metadataContainer: {
    padding: 8,
    height: 60,
  },
  filename: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  timestamp: {
    fontSize: 10,
    color: '#666',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalScrollContent: {
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: 300,
  },
  modalMetadata: {
    padding: 16,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  metadataRow: {
    marginBottom: 12,
  },
  metadataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ImageCard;

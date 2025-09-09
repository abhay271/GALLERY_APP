/**
 * LoadingOverlay Component
 * 
 * Displays loading states with progress indicators for uploads and processing
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  type?: 'loading' | 'uploading' | 'bootstrapping';
}

const { width: screenWidth } = Dimensions.get('window');

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  progress,
  type = 'loading',
}) => {
  const getLoadingMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'uploading':
        return 'Uploading images...';
      case 'bootstrapping':
        return 'Setting up gallery...';
      default:
        return 'Loading...';
    }
  };

  const getLoadingIcon = () => {
    switch (type) {
      case 'uploading':
        return '📤';
      case 'bootstrapping':
        return '🚀';
      default:
        return '⏳';
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.icon}>{getLoadingIcon()}</Text>
          
          <ActivityIndicator
            size="large"
            color="#007AFF"
            style={styles.spinner}
          />
          
          <Text style={styles.message}>{getLoadingMessage()}</Text>
          
          {progress && progress.total > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress.percentage}%` },
                  ]}
                />
              </View>
              
              <Text style={styles.progressText}>
                {progress.current} / {progress.total} ({progress.percentage}%)
              </Text>
            </View>
          )}
          
          {type === 'bootstrapping' && (
            <Text style={styles.subMessage}>
              This may take a few minutes on first launch
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    maxWidth: screenWidth * 0.8,
    minWidth: 200,
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  subMessage: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default LoadingOverlay;

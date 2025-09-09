/**
 * Gallery App
 * 
 * AI-powered image gallery with search functionality
 * Integrates with backend API for image upload and semantic search
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { GalleryProvider } from './src/context/GalleryContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <GalleryProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="#000000" 
        translucent={false}
      />
      <AppNavigator />
    </GalleryProvider>
  );
};

export default App;

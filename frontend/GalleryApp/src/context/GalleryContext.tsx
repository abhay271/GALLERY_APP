/**
 * Gallery Context
 * 
 * Global state management for the gallery app using React Context
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ImageMetadata } from '../services/queryService';
import { CachedImage } from '../services/localImageCache';

// Action types
export enum GalleryActionTypes {
  SET_IMAGES = 'SET_IMAGES',
  ADD_IMAGES = 'ADD_IMAGES',
  SET_CACHED_IMAGES = 'SET_CACHED_IMAGES',
  SET_LOADING = 'SET_LOADING',
  SET_UPLOADING = 'SET_UPLOADING',
  SET_SEARCH_RESULTS = 'SET_SEARCH_RESULTS',
  SET_SEARCH_QUERY = 'SET_SEARCH_QUERY',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
  SET_BOOTSTRAP_COMPLETE = 'SET_BOOTSTRAP_COMPLETE',
  SET_CACHE_PROGRESS = 'SET_CACHE_PROGRESS',
  SET_UPLOAD_PROGRESS = 'SET_UPLOAD_PROGRESS',
  CLEAR_SEARCH = 'CLEAR_SEARCH',
}

// State interface
export interface GalleryState {
  images: ImageMetadata[];
  cachedImages: CachedImage[];
  searchResults: ImageMetadata[];
  searchQuery: string;
  isLoading: boolean;
  isUploading: boolean;
  isBootstrapComplete: boolean;
  uploadProgress: {
    current: number;
    total: number;
    percentage: number;
  };
  error: string | null;
}

// Action interface
export interface GalleryAction {
  type: GalleryActionTypes;
  payload?: any;
}

// Initial state
const initialState: GalleryState = {
  images: [],
  cachedImages: [],
  searchResults: [],
  searchQuery: '',
  isLoading: false,
  isUploading: false,
  isBootstrapComplete: false,
  uploadProgress: {
    current: 0,
    total: 0,
    percentage: 0,
  },
  error: null,
};

// Reducer function
function galleryReducer(state: GalleryState, action: GalleryAction): GalleryState {
  switch (action.type) {
    case GalleryActionTypes.SET_IMAGES:
      return {
        ...state,
        images: action.payload,
        error: null,
      };

    case GalleryActionTypes.ADD_IMAGES:
      return {
        ...state,
        images: [...state.images, ...action.payload],
        error: null,
      };

    case GalleryActionTypes.SET_CACHED_IMAGES:
      return {
        ...state,
        cachedImages: action.payload,
        error: null,
      };

    case GalleryActionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case GalleryActionTypes.SET_UPLOADING:
      return {
        ...state,
        isUploading: action.payload,
      };

    case GalleryActionTypes.SET_SEARCH_RESULTS:
      return {
        ...state,
        searchResults: action.payload,
        error: null,
      };

    case GalleryActionTypes.SET_SEARCH_QUERY:
      return {
        ...state,
        searchQuery: action.payload,
      };

    case GalleryActionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
        isUploading: false,
      };

    case GalleryActionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case GalleryActionTypes.SET_BOOTSTRAP_COMPLETE:
      return {
        ...state,
        isBootstrapComplete: action.payload,
      };

    case GalleryActionTypes.SET_UPLOAD_PROGRESS:
      return {
        ...state,
        uploadProgress: action.payload,
      };

    case GalleryActionTypes.SET_CACHE_PROGRESS:
      return {
        ...state,
        uploadProgress: action.payload, // Reuse upload progress for cache progress
      };

    case GalleryActionTypes.CLEAR_SEARCH:
      return {
        ...state,
        searchResults: [],
        searchQuery: '',
      };

    default:
      return state;
  }
}

// Context
const GalleryContext = createContext<{
  state: GalleryState;
  dispatch: React.Dispatch<GalleryAction>;
} | undefined>(undefined);

// Provider component
interface GalleryProviderProps {
  children: ReactNode;
}

export const GalleryProvider: React.FC<GalleryProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(galleryReducer, initialState);

  return (
    <GalleryContext.Provider value={{ state, dispatch }}>
      {children}
    </GalleryContext.Provider>
  );
};

// Hook to use gallery context
export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

// Action creators for easier usage
export const galleryActions = {
  setImages: (images: ImageMetadata[]) => ({
    type: GalleryActionTypes.SET_IMAGES,
    payload: images,
  }),

  addImages: (images: ImageMetadata[]) => ({
    type: GalleryActionTypes.ADD_IMAGES,
    payload: images,
  }),

  setCachedImages: (images: CachedImage[]) => ({
    type: GalleryActionTypes.SET_CACHED_IMAGES,
    payload: images,
  }),

  setLoading: (loading: boolean) => ({
    type: GalleryActionTypes.SET_LOADING,
    payload: loading,
  }),

  setUploading: (uploading: boolean) => ({
    type: GalleryActionTypes.SET_UPLOADING,
    payload: uploading,
  }),

  setSearchResults: (results: ImageMetadata[]) => ({
    type: GalleryActionTypes.SET_SEARCH_RESULTS,
    payload: results,
  }),

  setSearchQuery: (query: string) => ({
    type: GalleryActionTypes.SET_SEARCH_QUERY,
    payload: query,
  }),

  setError: (error: string) => ({
    type: GalleryActionTypes.SET_ERROR,
    payload: error,
  }),

  clearError: () => ({
    type: GalleryActionTypes.CLEAR_ERROR,
  }),

  setBootstrapComplete: (complete: boolean) => ({
    type: GalleryActionTypes.SET_BOOTSTRAP_COMPLETE,
    payload: complete,
  }),

  setUploadProgress: (current: number, total: number) => ({
    type: GalleryActionTypes.SET_UPLOAD_PROGRESS,
    payload: {
      current,
      total,
      percentage: total > 0 ? Math.round((current / total) * 100) : 0,
    },
  }),

  setCacheProgress: (current: number, total: number) => ({
    type: GalleryActionTypes.SET_CACHE_PROGRESS,
    payload: {
      current,
      total,
      percentage: total > 0 ? Math.round((current / total) * 100) : 0,
    },
  }),

  clearSearch: () => ({
    type: GalleryActionTypes.CLEAR_SEARCH,
  }),
};

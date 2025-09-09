/**
 * Environment Configuration
 * 
 * Configuration for API endpoints and app settings
 */

export const CONFIG = {
  // Backend API configuration
  API_BASE_URL: 'http://10.0.2.2:3000', // Android emulator uses 10.0.2.2 to access host localhost
  
  // API endpoints
  ENDPOINTS: {
    UPLOAD: '/upload',
    QUERY: '/query',
  },
  
  // App configuration
  APP: {
    IMAGES_PER_PAGE: 20,
    MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  },
  
  // Gallery configuration
  GALLERY: {
    COLUMNS: 2,
    IMAGE_MARGIN: 8,
    AUTO_UPLOAD_ON_BOOTSTRAP: true,
  },
};

export default CONFIG;

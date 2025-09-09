/**
 * Sample Images Utility
 * 
 * Provides sample image URLs for bootstrap functionality
 * These images will be used to populate the gallery initially
 */

export const SAMPLE_IMAGES = [
  // Nature/Landscapes
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
  'https://images.unsplash.com/photo-1414609245224-afa02bfb3fda?w=800&q=80',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80',
  
  // Urban/Architecture
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
  'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?w=800&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  
  // Animals
  'https://images.unsplash.com/photo-1444212477490-ca407925329e?w=800&q=80',
  'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=800&q=80',
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800&q=80',
  
  // Food
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&q=80',
  
  // Technology
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&q=80',
  
  // People/Lifestyle
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
];

/**
 * Get a random subset of sample images
 * @param count - Number of images to return
 * @returns Array of image URLs
 */
export const getRandomSampleImages = (count: number = 10): string[] => {
  const shuffled = [...SAMPLE_IMAGES].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, SAMPLE_IMAGES.length));
};

/**
 * Get sample images by category (based on description/content)
 */
export const SAMPLE_IMAGES_BY_CATEGORY = {
  nature: SAMPLE_IMAGES.slice(0, 4),
  urban: SAMPLE_IMAGES.slice(4, 7),
  animals: SAMPLE_IMAGES.slice(7, 10),
  food: SAMPLE_IMAGES.slice(10, 12),
  technology: SAMPLE_IMAGES.slice(12, 14),
  people: SAMPLE_IMAGES.slice(14, 16),
};

export default SAMPLE_IMAGES;

/**
 * Photo Upload Routes
 * 
 * Defines all endpoints for the gallery app:
 * - POST /api/upload - Upload single or multiple images
 * - POST /api/query - Search images by text query
 * - GET /api/stats - Get database statistics
 * - GET /api/health - Health check endpoint
 */

const express = require('express');
const router = express.Router();
const { adaptiveUpload } = require('../middlewares/upload.middleware');
const { 
    uploadImages, 
    queryImages, 
    getDatabaseStats, 
    healthCheck 
} = require('../controllers/upload.controller');

/**
 * POST /api/upload
 * Upload single or multiple images
 * 
 * Content-Type: multipart/form-data
 * Body:
 * - For single image: image (file)
 * - For multiple images: images (file array)
 * 
 * Test with cURL:
 * Single image:
 * curl -X POST http://localhost:3000/api/upload \
 *   -F "image=@/path/to/your/image.jpg"
 * 
 * Multiple images:
 * curl -X POST http://localhost:3000/api/upload \
 *   -F "images=@/path/to/image1.jpg" \
 *   -F "images=@/path/to/image2.jpg"
 */
router.post('/upload', adaptiveUpload, uploadImages);

/**
 * POST /api/query
 * Search for images using text query
 * 
 * Content-Type: application/json
 * Body: {
 *   "query": "search text",
 *   "limit": 10,           // optional, default: 10, max: 50
 *   "scoreThreshold": 0.7  // optional, default: 0.7, range: 0-1
 * }
 * 
 * Test with cURL:
 * curl -X POST http://localhost:3000/api/query \
 *   -H "Content-Type: application/json" \
 *   -d '{"query": "sunset over mountains", "limit": 5}'
 */
router.post('/query', queryImages);

/**
 * GET /api/stats
 * Get database statistics and collection info
 * 
 * Test with cURL:
 * curl -X GET http://localhost:3000/api/stats
 */
router.get('/stats', getDatabaseStats);

/**
 * GET /api/health
 * Health check endpoint
 * 
 * Test with cURL:
 * curl -X GET http://localhost:3000/api/health
 */
router.get('/health', healthCheck);

module.exports = router;
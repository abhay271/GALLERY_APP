
/**
 * Upload Controller
 * 
 * Handles image upload endpoints:
 * 1. Single image upload
 * 2. Batch image upload
 * 3. Search images by text query
 * 4. Get database statistics
 */

const embeddingService = require('../services/embedding.service');

/**
 * Upload single or multiple images
 * Endpoint: POST /api/upload
 * 
 * Body (multipart/form-data):
 * - Single: image (file)
 * - Multiple: images (files array)
 */
async function uploadImages(req, res, next) {
    try {
        const files = req.files || (req.file ? [req.file] : []);
        
        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No files uploaded. Please upload at least one image.',
                code: 'NO_FILES'
            });
        }

        console.log(`Received ${files.length} file(s) for processing`);

        // Validate files
        for (const file of files) {
            embeddingService.validateUploadedFile(file);
        }

        let result;

        if (files.length === 1) {
            // Process single image
            result = await embeddingService.processUploadedImage(
                files[0].path, 
                files[0].originalname
            );
            
            res.status(200).json({
                success: true,
                message: 'Image uploaded and processed successfully',
                data: result
            });
        } else {
            // Process multiple images (batch)
            result = await embeddingService.processMultipleImages(files);
            
            const statusCode = result.totalFailed > 0 ? 207 : 200; // 207 Multi-Status if some failed
            
            res.status(statusCode).json({
                success: true,
                message: `Batch upload completed: ${result.totalProcessed} successful, ${result.totalFailed} failed`,
                data: result
            });
        }

    } catch (error) {
        console.error('Error in uploadImages controller:', error);
        next(error);
    }
}

/**
 * Search for images using text query
 * Endpoint: POST /api/query
 * 
 * Body: {
 *   "query": "search text",
 *   "limit": 10 (optional),
 *   "scoreThreshold": 0.7 (optional)
 * }
 */
async function queryImages(req, res, next) {
    try {
        const { query, limit = 10, scoreThreshold = 0.7 } = req.body;

        if (!query || typeof query !== 'string' || query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Query text is required and must be a non-empty string',
                code: 'INVALID_QUERY'
            });
        }

        // Validate parameters
        const searchLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50); // Limit between 1-50
        const threshold = Math.min(Math.max(parseFloat(scoreThreshold) || 0.7, 0), 1); // Threshold between 0-1

        console.log(`Searching for images with query: "${query}"`);

        const result = await embeddingService.searchImages(
            query.trim(), 
            searchLimit, 
            threshold
        );

        res.status(200).json({
            success: true,
            message: `Found ${result.totalFound} matching images`,
            data: result
        });

    } catch (error) {
        console.error('Error in queryImages controller:', error);
        next(error);
    }
}

/**
 * Get database statistics and health info
 * Endpoint: GET /api/stats
 */
async function getDatabaseStats(req, res, next) {
    try {
        const stats = await embeddingService.getDatabaseStats();
        
        res.status(200).json({
            success: true,
            message: 'Database statistics retrieved successfully',
            data: stats
        });

    } catch (error) {
        console.error('Error in getDatabaseStats controller:', error);
        next(error);
    }
}

/**
 * Health check endpoint
 * Endpoint: GET /api/health
 */
async function healthCheck(req, res) {
    try {
        // Basic health check
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version,
            environment: process.env.NODE_ENV || 'development'
        };

        res.status(200).json({
            success: true,
            message: 'Service is healthy',
            data: health
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
}

module.exports = { 
    uploadImages,
    queryImages,
    getDatabaseStats,
    healthCheck,
    // Legacy alias for backward compatibility
    uploadPhoto: uploadImages
};
/**
 * Embedding Service
 * 
 * This service coordinates between OpenAI (for generating embeddings) 
 * and Qdrant (for storing and searching embeddings).
 * 
 * Main responsibilities:
 * 1. Process uploaded images (description + embedding generation)
 * 2. Store image data in vector database
 * 3. Handle search queries and return matching results
 */

const openaiService = require('./openai.service');
const qdrantService = require('../db/qdrant');
const fs = require('fs-extra');

class EmbeddingService {
    constructor() {
        this.isInitialized = false;
    }

    /**
     * Initialize the service (setup Qdrant collection)
     */
    async initialize() {
        try {
            console.log('Initializing Embedding Service...');
            
            // Validate OpenAI API key
            openaiService.validateApiKey();
            
            // Initialize Qdrant collection
            await qdrantService.initializeCollection();
            
            this.isInitialized = true;
            console.log('Embedding Service initialized successfully');
        } catch (error) {
            console.error('Error initializing Embedding Service:', error);
            throw error;
        }
    }

    /**
     * Process a single uploaded image
     * @param {string} imagePath - Path to the uploaded image
     * @param {string} originalFilename - Original filename from upload
     * @returns {Promise<Object>} - Processing result with metadata
     */
    async processUploadedImage(imagePath, originalFilename) {
        try {
            console.log(`Processing uploaded image: ${originalFilename}`);

            // Check if service is initialized
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Process image with OpenAI (generate description and embedding)
            const processedData = await openaiService.processImage(imagePath);
            
            // Update filename to original name
            processedData.filename = originalFilename;
            
            // Store in Qdrant vector database
            const pointId = await qdrantService.storeImageEmbedding(processedData);
            
            // Clean up temporary file
            await this.cleanupTemporaryFile(imagePath);
            
            console.log(`Successfully processed and stored: ${originalFilename}`);
            
            return {
                success: true,
                pointId,
                filename: originalFilename,
                description: processedData.description,
                timestamp: processedData.timestamp,
            };
        } catch (error) {
            console.error(`Error processing image ${originalFilename}:`, error);
            
            // Clean up temporary file even if processing failed
            await this.cleanupTemporaryFile(imagePath);
            
            throw error;
        }
    }

    /**
     * Process multiple uploaded images (batch upload)
     * @param {Array} imageFiles - Array of file objects with path and originalname
     * @returns {Promise<Array>} - Array of processing results
     */
    async processMultipleImages(imageFiles) {
        try {
            console.log(`Processing batch of ${imageFiles.length} images`);

            const results = [];
            const errors = [];

            // Process images sequentially to avoid API rate limits
            for (const file of imageFiles) {
                try {
                    const result = await this.processUploadedImage(file.path, file.originalname);
                    results.push(result);
                } catch (error) {
                    console.error(`Failed to process ${file.originalname}:`, error.message);
                    errors.push({
                        filename: file.originalname,
                        error: error.message,
                    });
                }
            }

            console.log(`Batch processing complete: ${results.length} successful, ${errors.length} failed`);

            return {
                successful: results,
                failed: errors,
                totalProcessed: results.length,
                totalFailed: errors.length,
            };
        } catch (error) {
            console.error('Error in batch processing:', error);
            throw error;
        }
    }

    /**
     * Search for images similar to a text query
     * @param {string} queryText - Search query
     * @param {number} limit - Maximum number of results (default: 10)
     * @param {number} scoreThreshold - Minimum similarity score (default: 0.7)
     * @returns {Promise<Array>} - Array of matching images
     */
    async searchImages(queryText, limit = 10, scoreThreshold = 0.7) {
        try {
            console.log(`Searching for images with query: "${queryText}"`);

            // Check if service is initialized
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Generate embedding for search query
            const queryEmbedding = await openaiService.processSearchQuery(queryText);
            
            // Search in Qdrant
            const results = await qdrantService.searchSimilarImages(
                queryEmbedding, 
                limit, 
                scoreThreshold
            );

            console.log(`Search completed: found ${results.length} matching images`);

            return {
                query: queryText,
                results: results,
                totalFound: results.length,
                searchParams: {
                    limit,
                    scoreThreshold,
                },
            };
        } catch (error) {
            console.error('Error searching images:', error);
            throw error;
        }
    }

    /**
     * Get database statistics
     * @returns {Promise<Object>} - Database info and statistics
     */
    async getDatabaseStats() {
        try {
            // Check if service is initialized
            if (!this.isInitialized) {
                await this.initialize();
            }

            const collectionInfo = await qdrantService.getCollectionInfo();
            
            return {
                collectionName: qdrantService.collectionName,
                totalPoints: collectionInfo.points_count,
                vectorSize: collectionInfo.config.params.vectors.size,
                distance: collectionInfo.config.params.vectors.distance,
                status: collectionInfo.status,
            };
        } catch (error) {
            console.error('Error getting database stats:', error);
            throw error;
        }
    }

    /**
     * Clean up temporary uploaded file
     * @param {string} filePath - Path to temporary file
     */
    async cleanupTemporaryFile(filePath) {
        try {
            if (await fs.pathExists(filePath)) {
                await fs.unlink(filePath);
                console.log(`Cleaned up temporary file: ${filePath}`);
            }
        } catch (error) {
            console.error(`Error cleaning up file ${filePath}:`, error);
            // Don't throw error for cleanup failures
        }
    }

    /**
     * Validate uploaded file
     * @param {Object} file - Multer file object
     * @returns {boolean} - Whether file is valid
     */
    validateUploadedFile(file) {
        if (!file) {
            throw new Error('No file uploaded');
        }

        // Check file size (limit to 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            throw new Error('File size too large. Maximum size is 10MB');
        }

        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
            throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed');
        }

        return true;
    }
}

module.exports = new EmbeddingService();

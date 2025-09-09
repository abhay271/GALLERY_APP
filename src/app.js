/**
 * Express Application Setup
 * 
 * Main application file that configures Express server with:
 * - CORS support
 * - JSON parsing
 * - Route handling
 * - Error handling
 * - Service initialization
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes and middleware
const photouploadRoutes = require('./routes/photoupload');
const { errorHandler, notFoundHandler } = require('./middlewares/error.middleware');
const embeddingService = require('./services/embedding.service');

const app = express();

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Configure as needed for production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images if needed
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}

// API routes
app.use('/api', photouploadRoutes);

// Root endpoint with API information
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Gallery App Backend API',
        version: '1.0.0',
        endpoints: {
            'POST /api/upload': 'Upload single or multiple images',
            'POST /api/query': 'Search images by text query',
            'GET /api/stats': 'Get database statistics',
            'GET /api/health': 'Health check endpoint'
        },
        documentation: {
            setup: 'See .env file for configuration',
            requirements: [
                'Qdrant vector database running on localhost:6333',
                'OpenAI API key configured in .env file'
            ]
        },
        timestamp: new Date().toISOString()
    });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handling middleware
app.use(errorHandler);

// Initialize services when app starts
const initializeServices = async () => {
    try {
        console.log('Initializing application services...');
        
        // Initialize embedding service (this will setup Qdrant collection)
        await embeddingService.initialize();
        
        console.log('All services initialized successfully');
    } catch (error) {
        console.error('Failed to initialize services:', error.message);
        console.error('Please check your configuration:');
        console.error('1. Qdrant is running on localhost:6333');
        console.error('2. OpenAI API key is set in .env file');
        console.error('3. All required dependencies are installed');
        
        // Don't exit the process, let the app start but log the error
        // This allows for manual service initialization through API calls
    }
};

// Initialize services (non-blocking)
initializeServices();

module.exports = app;


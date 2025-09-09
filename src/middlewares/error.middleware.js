/**
 * Error Handling Middleware
 * 
 * This middleware provides centralized error handling for the application.
 * It catches and formats errors from controllers and services.
 */

const errorHandler = (err, req, res, next) => {
    console.error('Error occurred:', err);

    // Default error response
    let error = {
        success: false,
        message: 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
    };

    // Handle specific error types
    if (err.message) {
        error.message = err.message;
    }

    // OpenAI API errors
    if (err.message && err.message.includes('OpenAI')) {
        error.code = 'OPENAI_ERROR';
        error.message = err.message;
    }

    // Qdrant database errors
    if (err.message && err.message.includes('Qdrant')) {
        error.code = 'DATABASE_ERROR';
        error.message = 'Database connection error. Please ensure Qdrant is running.';
    }

    // File validation errors
    if (err.message && (err.message.includes('file') || err.message.includes('upload'))) {
        error.code = 'FILE_ERROR';
        error.message = err.message;
    }

    // API key configuration errors
    if (err.message && err.message.includes('API key')) {
        error.code = 'CONFIG_ERROR';
        error.message = err.message;
    }

    // Determine status code based on error type
    let statusCode = 500;
    
    if (error.code === 'FILE_ERROR' || error.code === 'CONFIG_ERROR') {
        statusCode = 400;
    } else if (error.code === 'OPENAI_ERROR') {
        statusCode = 502; // Bad Gateway for external service errors
    } else if (error.code === 'DATABASE_ERROR') {
        statusCode = 503; // Service Unavailable for database errors
    }

    res.status(statusCode).json(error);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.path} not found`,
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
    });
};

module.exports = {
    errorHandler,
    notFoundHandler,
};

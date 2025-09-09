/**
 * Server Entry Point
 * 
 * Starts the Express server and handles graceful shutdown
 */

require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Gallery App Backend Server Started');
    console.log('='.repeat(50));
    console.log(`📍 Server running on: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log(`   GET  http://localhost:${PORT}/                - API Information`);
    console.log(`   POST http://localhost:${PORT}/api/upload      - Upload Images`);
    console.log(`   POST http://localhost:${PORT}/api/query       - Search Images`);
    console.log(`   GET  http://localhost:${PORT}/api/stats       - Database Stats`);
    console.log(`   GET  http://localhost:${PORT}/api/health      - Health Check`);
    console.log('');
    console.log('🔧 Setup Requirements:');
    console.log('   ✓ Install Qdrant: docker run -p 6333:6333 qdrant/qdrant');
    console.log('   ✓ Configure OpenAI API key in .env file');
    console.log('   ✓ Test endpoints with Postman or cURL');
    console.log('='.repeat(50));
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
    console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
/**
 * Test Script for Gallery App Backend
 * 
 * This script demonstrates how to test all API endpoints
 * Run with: node test-api.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Test configuration
const config = {
    baseURL: BASE_URL,
    timeout: 30000, // 30 seconds for image processing
};

async function testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');
    try {
        const response = await axios.get(`${BASE_URL}/api/health`, config);
        console.log('✅ Health Check Response:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Health Check Failed:', error.message);
        return false;
    }
}

async function testApiInfo() {
    console.log('\n🔍 Testing API Info...');
    try {
        const response = await axios.get(`${BASE_URL}/`, config);
        console.log('✅ API Info Response:', response.data);
        return true;
    } catch (error) {
        console.error('❌ API Info Failed:', error.message);
        return false;
    }
}

async function testDatabaseStats() {
    console.log('\n🔍 Testing Database Stats...');
    try {
        const response = await axios.get(`${BASE_URL}/api/stats`, config);
        console.log('✅ Database Stats Response:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Database Stats Failed:', error.message);
        if (error.response) {
            console.error('Error Details:', error.response.data);
        }
        return false;
    }
}

async function testImageUpload() {
    console.log('\n🔍 Testing Image Upload...');
    
    // Create a test image file (1x1 pixel PNG)
    const testImagePath = path.join(__dirname, 'test-image.png');
    
    // Create a minimal valid PNG file (1x1 transparent pixel)
    const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
        0x49, 0x48, 0x44, 0x52, // IHDR chunk type
        0x00, 0x00, 0x00, 0x01, // Width: 1
        0x00, 0x00, 0x00, 0x01, // Height: 1
        0x08, 0x06, 0x00, 0x00, 0x00, // Bit depth: 8, Color type: RGBA, Compression: 0, Filter: 0, Interlace: 0
        0x1F, 0x15, 0xC4, 0x89, // CRC
        0x00, 0x00, 0x00, 0x0B, // IDAT chunk length
        0x49, 0x44, 0x41, 0x54, // IDAT chunk type
        0x78, 0x9C, 0x62, 0x00, 0x02, 0x00, 0x00, 0x05, 0x00, 0x01, 0x0D, // Compressed image data
        0x0A, 0x2D, 0xB4, // CRC
        0x00, 0x00, 0x00, 0x00, // IEND chunk length
        0x49, 0x45, 0x4E, 0x44, // IEND chunk type
        0xAE, 0x42, 0x60, 0x82  // CRC
    ]);
    
    try {
        // Write test image
        fs.writeFileSync(testImagePath, pngData);
        console.log('📄 Created test image:', testImagePath);
        
        // Create form data
        const formData = new FormData();
        formData.append('image', fs.createReadStream(testImagePath), {
            filename: 'test-image.png',
            contentType: 'image/png'
        });
        
        const response = await axios.post(`${BASE_URL}/api/upload`, formData, {
            ...config,
            headers: {
                ...formData.getHeaders(),
            },
        });
        
        console.log('✅ Image Upload Response:', response.data);
        
        // Clean up test file
        fs.unlinkSync(testImagePath);
        console.log('🗑️ Cleaned up test image');
        
        return true;
    } catch (error) {
        console.error('❌ Image Upload Failed:', error.message);
        if (error.response) {
            console.error('Error Details:', error.response.data);
        }
        
        // Clean up test file if it exists
        if (fs.existsSync(testImagePath)) {
            fs.unlinkSync(testImagePath);
        }
        
        return false;
    }
}

async function testImageSearch() {
    console.log('\n🔍 Testing Image Search...');
    try {
        const searchQuery = {
            query: "test image",
            limit: 5,
            scoreThreshold: 0.5
        };
        
        const response = await axios.post(`${BASE_URL}/api/query`, searchQuery, {
            ...config,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        console.log('✅ Image Search Response:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Image Search Failed:', error.message);
        if (error.response) {
            console.error('Error Details:', error.response.data);
        }
        return false;
    }
}

async function runAllTests() {
    console.log('🧪 Starting Gallery App Backend API Tests');
    console.log('=' * 50);
    
    const tests = [
        { name: 'API Info', fn: testApiInfo },
        { name: 'Health Check', fn: testHealthCheck },
        { name: 'Database Stats', fn: testDatabaseStats },
        { name: 'Image Upload', fn: testImageUpload },
        { name: 'Image Search', fn: testImageSearch },
    ];
    
    const results = [];
    
    for (const test of tests) {
        try {
            const success = await test.fn();
            results.push({ name: test.name, success });
        } catch (error) {
            console.error(`❌ ${test.name} threw exception:`, error.message);
            results.push({ name: test.name, success: false });
        }
    }
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log('=' * 30);
    
    let passedCount = 0;
    results.forEach(result => {
        const status = result.success ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${result.name}`);
        if (result.success) passedCount++;
    });
    
    console.log(`\n📈 Overall: ${passedCount}/${results.length} tests passed`);
    
    if (passedCount === results.length) {
        console.log('🎉 All tests passed! The API is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the configuration:');
        console.log('   1. Server is running on http://localhost:3000');
        console.log('   2. Qdrant is running and accessible');
        console.log('   3. OpenAI API key is configured');
    }
}

// Check if server is running before starting tests
async function checkServerRunning() {
    try {
        await axios.get(`${BASE_URL}/api/health`, { timeout: 5000 });
        return true;
    } catch (error) {
        return false;
    }
}

// Main execution
async function main() {
    console.log('🔌 Checking if server is running...');
    
    const isRunning = await checkServerRunning();
    if (!isRunning) {
        console.error('❌ Server is not running on http://localhost:3000');
        console.log('💡 Please start the server first:');
        console.log('   npm start');
        console.log('   or');
        console.log('   npm run dev');
        process.exit(1);
    }
    
    console.log('✅ Server is running, starting tests...');
    await runAllTests();
}

// Run tests if this file is executed directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Test runner failed:', error.message);
        process.exit(1);
    });
}

module.exports = {
    testHealthCheck,
    testApiInfo,
    testDatabaseStats,
    testImageUpload,
    testImageSearch,
    runAllTests,
};

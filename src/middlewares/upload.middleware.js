/**
 * Upload Middleware using Multer
 * 
 * This middleware handles file uploads and temporary storage.
 * Files are stored temporarily in the 'uploads/' directory and
 * deleted after processing.
 * 
 * Features:
 * - Single and multiple file uploads
 * - File type validation
 * - File size limits
 * - Temporary storage with cleanup
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, WebP, and BMP images are allowed.`), false);
    }
};

// Configure multer with options
const uploadConfig = {
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 10, // Maximum 10 files in batch upload
    }
};

// Create multer instances for different upload scenarios
const upload = multer(uploadConfig);

// Middleware for single file upload
const uploadSingle = upload.single('image');

// Middleware for multiple file uploads (batch)
const uploadMultiple = upload.array('images', 10); // Max 10 files

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                return res.status(400).json({
                    success: false,
                    error: 'File too large. Maximum size is 10MB per file.',
                    code: 'FILE_TOO_LARGE'
                });
            case 'LIMIT_FILE_COUNT':
                return res.status(400).json({
                    success: false,
                    error: 'Too many files. Maximum 10 files per upload.',
                    code: 'TOO_MANY_FILES'
                });
            case 'LIMIT_UNEXPECTED_FILE':
                return res.status(400).json({
                    success: false,
                    error: 'Unexpected file field. Use "image" for single upload or "images" for batch upload.',
                    code: 'UNEXPECTED_FIELD'
                });
            default:
                return res.status(400).json({
                    success: false,
                    error: `Upload error: ${error.message}`,
                    code: 'UPLOAD_ERROR'
                });
        }
    } else if (error) {
        // Custom file filter errors
        return res.status(400).json({
            success: false,
            error: error.message,
            code: 'INVALID_FILE'
        });
    }
    
    next();
};

// Wrapper function for single upload with error handling
const singleUploadWithErrorHandling = (req, res, next) => {
    uploadSingle(req, res, (error) => {
        handleUploadError(error, req, res, next);
    });
};

// Wrapper function for multiple upload with error handling
const multipleUploadWithErrorHandling = (req, res, next) => {
    uploadMultiple(req, res, (error) => {
        handleUploadError(error, req, res, next);
    });
};

// Middleware to detect upload type and handle accordingly
const adaptiveUpload = (req, res, next) => {
    // Check content-type to determine if it's multipart
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
        return res.status(400).json({
            success: false,
            error: 'Content-Type must be multipart/form-data for file uploads.',
            code: 'INVALID_CONTENT_TYPE'
        });
    }

    // Use multiple upload handler (it can handle single files too)
    multipleUploadWithErrorHandling(req, res, next);
};

module.exports = {
    uploadSingle: singleUploadWithErrorHandling,
    uploadMultiple: multipleUploadWithErrorHandling,
    adaptiveUpload,
    handleUploadError,
};

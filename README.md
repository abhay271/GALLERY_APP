# Gallery App Backend

A Node.js + Express backend for a mobile gallery app with AI-powered image search capabilities using OpenAI Vision API and Qdrant vector database.

## Features

- **Image Upload**: Single and batch image uploads with automatic processing
- **AI-Powered Analysis**: Automatic image description generation using OpenAI GPT-4o-mini
- **Vector Search**: Semantic image search using text queries and embeddings
- **Vector Database**: Efficient storage and retrieval using Qdrant
- **RESTful API**: Clean API endpoints for frontend integration
- **Error Handling**: Comprehensive error handling and validation
- **File Management**: Automatic cleanup of temporary uploaded files

## Architecture

```
src/
├── controllers/     # Request handling logic
├── routes/         # API endpoint definitions  
├── services/       # Business logic (OpenAI, embeddings)
├── middlewares/    # Upload handling, error management
├── db/            # Qdrant vector database client
└── app.js         # Express application setup
```

## Prerequisites

- **Node.js** >= 18.0.0
- **Qdrant** vector database
- **OpenAI API** key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Qdrant Vector Database

#### Option A: Using Docker (Recommended)
```bash
docker run -p 6333:6333 qdrant/qdrant
```

#### Option B: Native Installation
1. Download from [Qdrant Releases](https://github.com/qdrant/qdrant/releases)
2. Run the executable with default settings

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Qdrant Configuration
QDRANT_HOST=localhost
QDRANT_PORT=6333
QDRANT_COLLECTION=gallery_images
```

### 4. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Update the `OPENAI_API_KEY` in your `.env` file

### 5. Start the Server

#### Development (with auto-restart)
```bash
npm run dev
```

#### Production
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Upload Images
**POST** `/api/upload`

Upload single or multiple images for processing.

**Request:**
- Content-Type: `multipart/form-data`
- Body: 
  - Single: `image` (file)
  - Multiple: `images` (file array)

**Response:**
```json
{
  "success": true,
  "message": "Image uploaded and processed successfully",
  "data": {
    "pointId": "1234567890",
    "filename": "example.jpg",
    "description": "AI-generated description...",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Search Images
**POST** `/api/query`

Search for images using natural language queries.

**Request:**
```json
{
  "query": "sunset over mountains",
  "limit": 10,
  "scoreThreshold": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "message": "Found 5 matching images",
  "data": {
    "query": "sunset over mountains",
    "results": [
      {
        "id": "1234567890",
        "score": 0.92,
        "filename": "sunset.jpg",
        "description": "Beautiful sunset over mountain range...",
        "timestamp": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalFound": 5
  }
}
```

### 3. Database Statistics
**GET** `/api/stats`

Get information about the vector database.

**Response:**
```json
{
  "success": true,
  "data": {
    "collectionName": "gallery_images",
    "totalPoints": 150,
    "vectorSize": 1536,
    "distance": "Cosine",
    "status": "green"
  }
}
```

### 4. Health Check
**GET** `/api/health`

Check service health and status.

**Response:**
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "uptime": 3600,
    "version": "v18.0.0"
  }
}
```

## Testing with cURL

### Upload Single Image
```bash
curl -X POST http://localhost:3000/api/upload \\
  -F "image=@/path/to/your/image.jpg"
```

### Upload Multiple Images
```bash
curl -X POST http://localhost:3000/api/upload \\
  -F "images=@/path/to/image1.jpg" \\
  -F "images=@/path/to/image2.jpg"
```

### Search Images
```bash
curl -X POST http://localhost:3000/api/query \\
  -H "Content-Type: application/json" \\
  -d '{"query": "sunset over mountains", "limit": 5}'
```

### Get Statistics
```bash
curl -X GET http://localhost:3000/api/stats
```

## Testing with Postman

1. **Upload Image**:
   - Method: POST
   - URL: `http://localhost:3000/api/upload`
   - Body: form-data
   - Key: `image` (type: File)
   - Value: Select your image file

2. **Search Images**:
   - Method: POST
   - URL: `http://localhost:3000/api/query`
   - Headers: `Content-Type: application/json`
   - Body: raw JSON
   ```json
   {
     "query": "your search text here",
     "limit": 10
   }
   ```

## Configuration

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)

### File Size Limits
- Maximum file size: 10MB per image
- Maximum batch size: 10 images per request

### OpenAI Models Used
- **Vision**: `gpt-4o-mini` (cost-effective image analysis)
- **Embeddings**: `text-embedding-3-small` (efficient 1536-dimensional vectors)

## Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Ensure `OPENAI_API_KEY` is set in `.env` file
   - Verify the API key is valid and has sufficient credits

2. **"Database connection error"**
   - Check if Qdrant is running: `docker ps` or check process list
   - Verify Qdrant is accessible at `localhost:6333`

3. **"File too large" errors**
   - Ensure images are under 10MB
   - Use image compression tools if needed

4. **Upload failures**
   - Check file format is supported
   - Verify `uploads/` directory exists and is writable

### Checking Service Status

```bash
# Check Qdrant is running
curl http://localhost:6333/health

# Check API health
curl http://localhost:3000/api/health

# View server logs
npm run dev
```

## Development

### Directory Structure
```
project/
├── src/
│   ├── controllers/          # HTTP request handlers
│   │   └── upload.controller.js
│   ├── routes/              # API route definitions
│   │   └── photoupload.js
│   ├── services/            # Business logic
│   │   ├── openai.service.js
│   │   └── embedding.service.js
│   ├── middlewares/         # Express middleware
│   │   ├── upload.middleware.js
│   │   └── error.middleware.js
│   ├── db/                  # Database clients
│   │   └── qdrant.js
│   └── app.js              # Express app setup
├── uploads/                 # Temporary file storage
├── .env                    # Environment configuration
├── server.js              # Server entry point
└── package.json           # Dependencies and scripts
```

### Adding New Features

1. **New Endpoints**: Add routes in `src/routes/`
2. **Business Logic**: Add services in `src/services/`
3. **Request Handling**: Add controllers in `src/controllers/`
4. **Middleware**: Add middleware in `src/middlewares/`

## License

ISC

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed and configured
3. Check server logs for detailed error messages

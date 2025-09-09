/**
 * Azure OpenAI Service for Image Analysis and Text Embeddings
 * 
 * This service handles:
 * 1. Image description generation using Azure OpenAI Vision models
 * 2. Text embedding generation for similarity search
 * 
 * Setup Instructions:
 * 1. Get your Azure OpenAI credentials from Azure Portal
 * 2. Set the following in your .env file:
 *    - OPENAI_API_KEY (Azure OpenAI key)
 *    - OPENAI_BASE_URL (Azure OpenAI endpoint)
 *    - OPENAI_API_VERSION (API version)
 *    - OPENAI_DEPLOYMENT_NAME (GPT-4o deployment name)
 *    - OPENAI_EMBEDDING_DEPLOYMENT (embedding deployment name)
 */

const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

class OpenAIService {
    constructor() {
        // Initialize Azure OpenAI client
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: `${process.env.OPENAI_BASE_URL}/openai/deployments`,
            defaultQuery: { 'api-version': process.env.OPENAI_API_VERSION },
            defaultHeaders: {
                'api-key': process.env.OPENAI_API_KEY,
            },
        });
        
        // Azure OpenAI deployment configurations
        this.visionDeployment = process.env.OPENAI_DEPLOYMENT_NAME || 'gpt-4o';
        this.embeddingDeployment = process.env.OPENAI_EMBEDDING_DEPLOYMENT || 'text-embedding-ada-002';
        this.apiVersion = process.env.OPENAI_API_VERSION || '2023-07-01-preview';
    }

    /**
     * Generate a detailed description of an uploaded image using Azure OpenAI
     * @param {string} imagePath - Path to the image file
     * @returns {Promise<string>} - AI-generated description
     */
    async generateImageDescription(imagePath) {
        try {
            // Read image file and convert to base64
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = this.getMimeType(imagePath);

            console.log(`Analyzing image with Azure OpenAI: ${path.basename(imagePath)}`);

            // Send image to Azure OpenAI Vision API
            const response = await this.openai.chat.completions.create({
                model: this.visionDeployment,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Please analyze this image and provide a detailed, descriptive caption. 
                                       Focus on:
                                       - Main subjects and objects
                                       - Setting and environment
                                       - Colors, lighting, and mood
                                       - Activities or actions taking place
                                       - Any notable details or features
                                       
                                       Keep the description natural and searchable, as it will be used 
                                       for finding similar images through text queries.`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Image}`
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 300,
                temperature: 0.3, // Lower temperature for more consistent descriptions
            });

            const description = response.choices[0].message.content.trim();
            console.log(`Generated description: ${description.substring(0, 100)}...`);
            
            return description;
        } catch (error) {
            console.error('Error generating image description with Azure OpenAI:', error);
            
            // Check for specific Azure OpenAI API errors
            if (error.status === 401) {
                throw new Error('Invalid Azure OpenAI API key or configuration. Please check your credentials in .env file');
            } else if (error.status === 429) {
                throw new Error('Azure OpenAI API rate limit exceeded. Please try again later');
            } else if (error.status === 400) {
                throw new Error('Invalid image format or request. Please check the image file and deployment configuration');
            } else if (error.status === 404) {
                throw new Error('Azure OpenAI deployment not found. Please check OPENAI_DEPLOYMENT_NAME in .env file');
            }
            
            throw error;
        }
    }

    /**
     * Generate text embedding for similarity search using Azure OpenAI
     * @param {string} text - Text to generate embedding for
     * @returns {Promise<Array<number>>} - Embedding vector
     */
    async generateTextEmbedding(text) {
        try {
            console.log(`Generating embedding with Azure OpenAI for text: ${text.substring(0, 50)}...`);

            const response = await this.openai.embeddings.create({
                model: this.embeddingDeployment,
                input: text,
                encoding_format: "float",
            });

            const embedding = response.data[0].embedding;
            console.log(`Generated embedding with ${embedding.length} dimensions`);
            
            return embedding;
        } catch (error) {
            console.error('Error generating text embedding with Azure OpenAI:', error);
            
            // Check for specific Azure OpenAI API errors
            if (error.status === 401) {
                throw new Error('Invalid Azure OpenAI API key or configuration. Please check your credentials in .env file');
            } else if (error.status === 429) {
                throw new Error('Azure OpenAI API rate limit exceeded. Please try again later');
            } else if (error.status === 404) {
                throw new Error('Azure OpenAI embedding deployment not found. Please check OPENAI_EMBEDDING_DEPLOYMENT in .env file');
            }
            
            throw error;
        }
    }

    /**
     * Process an image: generate description and embedding
     * @param {string} imagePath - Path to the image file
     * @returns {Promise<Object>} - Object containing description and embedding
     */
    async processImage(imagePath) {
        try {
            // Generate description
            const description = await this.generateImageDescription(imagePath);
            
            // Generate embedding from description
            const embedding = await this.generateTextEmbedding(description);
            
            return {
                description,
                embedding,
                filename: path.basename(imagePath),
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            console.error(`Error processing image ${imagePath}:`, error);
            throw error;
        }
    }

    /**
     * Generate embedding for a search query
     * @param {string} query - Search query text
     * @returns {Promise<Array<number>>} - Query embedding vector
     */
    async processSearchQuery(query) {
        try {
            console.log(`Processing search query: "${query}"`);
            return await this.generateTextEmbedding(query);
        } catch (error) {
            console.error('Error processing search query:', error);
            throw error;
        }
    }

    /**
     * Get MIME type based on file extension
     * @param {string} filePath - Path to the file
     * @returns {string} - MIME type
     */
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp',
        };
        return mimeTypes[ext] || 'image/jpeg';
    }

    /**
     * Validate that the Azure OpenAI configuration is properly set
     */
    validateApiKey() {
        const requiredEnvVars = [
            'OPENAI_API_KEY',
            'OPENAI_BASE_URL',
            'OPENAI_API_VERSION',
            'OPENAI_DEPLOYMENT_NAME'
        ];

        const missingVars = requiredEnvVars.filter(varName => 
            !process.env[varName] || process.env[varName] === 'your_openai_api_key'
        );

        if (missingVars.length > 0) {
            throw new Error(`Azure OpenAI configuration incomplete. Missing or invalid: ${missingVars.join(', ')}. Please configure these in your .env file.`);
        }

        console.log('✅ Azure OpenAI configuration validated');
    }
}

module.exports = new OpenAIService();

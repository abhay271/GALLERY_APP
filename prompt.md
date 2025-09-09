Create a Node.js + Express backend for a mobile gallery app using my existing directory structure exactly: controllers/, routes/, services/, middlewares/, db/, uploads/. Do not create extra folders.

Features:

1. **Upload Endpoint (/upload)**:
   - Accept multiple images initially (batch) and single images afterward.
   - Use Multer to temporarily store uploads in 'uploads/'.
   - Process each image immediately with OpenAI API to generate a caption/description.
   - Compute embeddings for the description.
   - Store embeddings and image metadata (filename, timestamp, etc.) in a Qdrant vector database.
   - Delete uploaded images immediately after processing.

2. **Query Endpoint (/query)**:
   - Accept a text query from the client.
   - Compute embedding of the query.
   - Search Qdrant for the most similar images.
   - Return metadata of the top matching images.

3. **Database (Qdrant)**:
   - Include db/qdrant.js to setup the Qdrant client and collection.
   - Include instructions/comments on installing and running Qdrant locally (via Docker or native), creating the collection, and connecting from Node.js.
   - Explain how to configure Qdrant via .env (QDRANT_HOST, QDRANT_PORT, QDRANT_COLLECTION).

4. **AI Model (OpenAI)**:
   - Explain in comments which OpenAI API model to use for generating image descriptions (e.g., gpt-4o-mini or gpt-4o).
   - Include instructions/comments on setting up OpenAI API key in .env (OPENAI_API_KEY) and installing required packages.
   - Show how to send the image to OpenAI API and retrieve a description.

5. **.env file**:
   - PORT=3000
   - OPENAI_API_KEY=your_openai_api_key
   - QDRANT_HOST=localhost
   - QDRANT_PORT=6333
   - QDRANT_COLLECTION=gallery_images

6. **Directory structure guidance**:
   - controllers/: request handling
   - routes/: endpoint definitions
   - services/: OpenAI API logic, Qdrant embedding/storage logic
   - middlewares/: Multer upload and error handling
   - db/: Qdrant client
   - uploads/: temporary storage (deleted after processing)

7. **Coding standards**:
   - Async/await, proper try/catch error handling
   - Well-commented code explaining each step
   - Separation of concerns

8. **Dependencies**:
   - express, multer, dotenv, axios, qdrant-client, fs-extra, cors
   - Include instructions/comments on installing dependencies and testing endpoints.

9. **Additional instructions**:
   - Only backend; frontend not required
   - Include guidance in comments for testing using Postman or cURL
   - Explain setup steps for both Qdrant and OpenAI model so that backend is ready to run immediately after setup

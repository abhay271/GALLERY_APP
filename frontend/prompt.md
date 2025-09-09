Create a React Native frontend for a mobile gallery app that integrates with an existing Node.js + Express backend with the following endpoints:

1. POST /upload:
   - Accepts multiple images or single images.
   - Receives images as multipart/form-data with field name "images".
   - Returns a status message after processing.

2. POST /query:
   - Accepts JSON { query: "text describing images" }.
   - Returns an array of image metadata including id, filename, timestamp, description, and optionally future fields like faces, relationships, temporal_info.

Frontend requirements:

1. **Initial Bootstrap**
   - On first launch, fetch 50 random images from a public API (like Unsplash or Lorem Picsum) to populate the gallery.
   - Automatically POST these images to the backend /upload endpoint along with any required metadata.
   - Show upload progress and success/failure messages.

2. **Automatic Future Uploads**
   - Monitor new images added to the phone gallery (or selected by user) and automatically POST them to /upload with required metadata.
   - Maintain a local record of uploaded images to avoid duplicates.

3. **Gallery Display**
   - Display all images in a grid view like a typical mobile gallery.
   - Each image card should show metadata like filename and timestamp.
   - Modular ImageCard component that can later support displaying additional metadata like faces, relationships, or temporal info.

4. **Search Functionality**
   - A search bar at the top where the user types a query.
   - On pressing submit, send the query to /query endpoint in JSON format.
   - Display returned image metadata and corresponding images in the gallery view.
   - Handle no-results gracefully.

5. **Components & Directory Structure (industry-standard, expandable)**

src/
components/ # Reusable UI components like ImageCard, GalleryGrid
screens/ # MainGalleryScreen, UploadScreen, SearchScreen
services/ # API calls to backend (uploadService.js, queryService.js)
utils/ # Utility functions like image fetch, local caching
navigation/ # React Navigation setup
context/ # Global state using React Context or Redux
assets/ # Static assets like icons/images
hooks/ # Custom hooks for auto-upload, gallery monitoring, search
App.js # Entry point


Ensure modular code so new features like temporal sequencing, relationships, or multi-modal metadata can be added later.

6. **API Integration**
 - Use fetch or axios.
 - Ensure all request fields and payloads match backend requirements.
 - Include proper async/await handling and error handling.
 - Services should handle additional metadata in future responses.

7. **UI/UX**
 - Grid view layout for gallery.
 - Multiple image selection and preview before uploads.
 - Progress indicators for automatic uploads.
 - Responsive and mobile-friendly layout.
 - Search bar always visible at top.

8. **Dependencies**
 - React Native core
 - react-native-image-picker or similar for local gallery access
 - axios or fetch for HTTP requests
 - Optional: React Context or Redux for state management

9. **Additional Instructions**
 - Include comments explaining API integration and component usage.
 - Ensure that the app can bootstrap itself with initial random images and automatically handle future uploads.
 - Keep the code modular, maintainable, and ready for future expansion with temporal dependencies, relationships, faces, or other multi-modal metadata.


Also let the user know how to set everything up, what to install and how to run everything

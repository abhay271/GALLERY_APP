# 📱 AI-Powered Mobile Gallery App

A complete React Native mobile gallery application with AI-powered image analysis, semantic search, and intelligent descriptions powered by OpenAI GPT-4o and vector database technology.

## ✨ Features

- **📱 Mobile Gallery**: Beautiful React Native interface with 50 pre-loaded sample images.
- **🤖 AI Image Analysis**: Automatic intelligent descriptions using OpenAI GPT-4o.
- **🔍 Semantic Search**: Search images using natural language queries.
- **📤 Smart Upload**: Upload photos and get AI-generated descriptions.
- **💾 Local Caching**: Images cached locally on device using AsyncStorage.
- **🎯 Vector Search**: Powered by Qdrant vector database for accurate semantic matching.
- **📊 Real-time Stats**: View database statistics and health metrics.

## 🏗️ Architecture

```
📦 Project Structure
├── 🖥️  Backend (Node.js + Express)
│   ├── OpenAI GPT-4o (Image Analysis)
│   ├── Qdrant Vector Database (Semantic Search)
│   └── RESTful API Endpoints
└── 📱 Frontend (React Native + TypeScript)
    ├── Gallery Screen (Image Grid)
    ├── Upload Screen (Camera/Gallery)
    ├── Search Functionality
    └── Local Image Caching
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **React Native CLI**
- **Android Studio** (for Android development)
- **Docker** (for Qdrant database)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### 1. Clone and Setup Backend

```bash
# Clone the repository
git clone https://github.com/abhay271/GALLERY_APP.git
cd GALLERY_APP

# Install backend dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your OpenAI API key (see configuration section below)

# Start Qdrant database
docker run -p 6333:6333 qdrant/qdrant

# Start backend server
node server.js
```

### 2. Setup React Native Frontend

```bash
# Navigate to frontend directory
cd frontend/GalleryApp

# Install dependencies
npm install

# For iOS (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npx react-native start
```

### 3. Setup Android Development Environment

#### Install Android Studio

1.  **Download Android Studio**: [developer.android.com/studio](https://developer.android.com/studio)
2.  **Install with default settings** including:
    *   Android SDK
    *   Android SDK Platform
    *   Android Virtual Device (AVD)

#### Configure Environment Variables

Add these to your system environment variables:

```bash
# Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:JAVA_HOME\bin;$env:PATH"

# macOS/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### Create Android Virtual Device (AVD)

1.  **Open Android Studio**
2.  **Go to Tools → AVD Manager**
3.  **Create Virtual Device**
4.  **Choose**: Pixel 9 Pro (or any modern device)
5.  **Select**: API Level 34 (Android 14) or higher
6.  **Finish and Start** the emulator

### 4. Run the Mobile App

```bash
# Make sure your backend server is running (step 1)
# Make sure your Android emulator is running (step 3)

# Run on Android
npx react-native run-android

# Or run on iOS (macOS only)
npx react-native run-ios
```

## ⚙️ Configuration

### Environment Variables (.env)

Create a `.env` file in the root directory by copying `.env.example`.

### Get OpenAI API Key

1.  **Visit**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2.  **Sign up/Login** to OpenAI
3.  **Create new API key**
4.  **Copy and paste** into your `.env` file
5.  **Add credits** to your OpenAI account for API usage.

### ⚠️ Important Note About AI Models

This project was originally designed with Azure OpenAI, but you may encounter deployment name issues with Azure's embedding models. For easier setup and compatibility, we recommend using the direct **OpenAI API**.

If you wish to use a different model (e.g., from Hugging Face, or a local model), you will need to modify the backend services.

**Instructions for changing the AI Model:**

Ask your AI assistant (like GitHub Copilot) to help you modify the necessary files to integrate your chosen model. The key files to change are in the `src/services/` directory:

-   `embedding.service.js`: To change how text embeddings are generated.
-   `openai.service.js`: To change the image analysis and description generation logic.

You will also need to update the `.env` file with the appropriate API keys and endpoint URLs for your chosen service.

## 📱 Mobile App Usage

### Gallery Tab

-   **View 50 sample images** in a beautiful grid layout.
-   **Tap any image** to view full screen.
-   **Swipe gestures** for navigation.
-   **Pull to refresh** to reload images.

### Upload Tab

-   **Take Photo**: Use the device camera.
-   **Choose from Gallery**: Select existing photos from your device.
-   **AI Analysis**: Get intelligent descriptions automatically upon upload.
-   **Search Integration**: Uploaded images become instantly searchable.

### Search Functionality

-   **Natural Language**: "Show me photos of nature"
-   **Object Detection**: "Find images with cars"
-   **Scene Description**: "Pictures taken outdoors"
-   **Semantic Matching**: The AI understands the context and meaning behind your search queries.

## 🛠️ Development

### Backend API Endpoints

```http
GET    /                 # API information
POST   /api/upload       # Upload images
POST   /api/query        # Search images
GET    /api/stats        # Database statistics
GET    /api/health       # Health check
```

### Frontend Architecture

```
📁 src/
├── 📁 components/     # Reusable UI components
├── 📁 screens/        # Main app screens
├── 📁 services/       # API and business logic
├── 📁 context/        # React context providers
├── 📁 navigation/     # React Navigation setup
└── 📁 config/         # Configuration files
```

## 🐛 Troubleshooting

### Common Issues

#### "Backend is not reachable"

-   **Check**: Ensure the backend server is running on `http://localhost:3000`.
-   **Android Emulator**: The emulator uses the special IP `10.0.2.2` to access the host machine's `localhost`. The frontend code is already configured for this.
-   **Solution**: Make sure your backend server is running and accessible.

#### "Metro bundler port 8081 already in use"

-   **Solution**: Kill the existing Metro process. You can often do this by closing the terminal window where Metro is running, or by using `npx react-native start --reset-cache`.

#### Android build errors

-   **Clean build**: `cd android && ./gradlew clean && cd ..`
-   **Reset Metro**: `npx react-native start --reset-cache`
-   **Check environment variables**: Ensure `ANDROID_HOME` and `JAVA_HOME` are set correctly.

### Android Studio Setup Issues

1.  **`JAVA_HOME` not set**:
    ```bash
    # Windows
    $env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

    # macOS
    export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
    ```
2.  **`adb` not found**:
    ```bash
    # Add to PATH
    $env:PATH = "$env:ANDROID_HOME\platform-tools;$env:PATH"
    ```
3.  **Emulator not starting**:
    -   Open Android Studio → AVD Manager.
    -   Delete and recreate the virtual device.
    -   Ensure hardware acceleration (Intel HAXM or AMD Hypervisor) is enabled in your system's BIOS/UEFI settings.

## 🔧 Technologies Used

### Backend

-   **Node.js + Express**: RESTful API server
-   **OpenAI GPT-4o**: Advanced image analysis
-   **Qdrant**: Vector database for semantic search
-   **Multer**: File upload handling
-   **Axios**: HTTP client for OpenAI API

### Frontend

-   **React Native**: Cross-platform mobile development
-   **TypeScript**: Type-safe development
-   **React Navigation**: Screen navigation
-   **AsyncStorage**: Local data persistence
-   **React Native Image Picker**: Camera/gallery access

### DevOps

-   **Docker**: Containerized Qdrant database
-   **Git**: Version control
-   **Android Studio**: Mobile development environment

## 📄 License

MIT License - feel free to use this project for learning and commercial purposes.

---

**Built with ❤️ using React Native, OpenAI, and Qdrant**
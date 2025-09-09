# Android Development Environment Setup Guide

## 🔧 **Required Setup Steps:**

### **1. Install Android Studio & SDK**
1. **Download Android Studio**: https://developer.android.com/studio
2. **Install with default settings**
3. **Open SDK Manager** (Tools → SDK Manager)
4. **Install**:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools 33.0.0
   - Android Emulator
   - Android SDK Platform-Tools

### **2. Set Environment Variables**

#### **Option A: Using Android Studio (Recommended)**
1. **Open Android Studio**
2. **File → Settings → Appearance & Behavior → System Settings → Android SDK**
3. **Copy the SDK Path** (e.g., `C:\Users\abhay\AppData\Local\Android\Sdk`)
4. **Add to Windows Environment Variables:**
   - `ANDROID_HOME` = `C:\Users\abhay\AppData\Local\Android\Sdk`
   - `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr` (or wherever Java is installed)

#### **Option B: PowerShell Commands**
```powershell
# Set ANDROID_HOME (replace path with your actual SDK path)
[Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\abhay\AppData\Local\Android\Sdk", "User")

# Set JAVA_HOME (Android Studio includes OpenJDK)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")

# Add to PATH
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$newPath = "$currentPath;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
[Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
```

### **3. Create Android Virtual Device (AVD)**
1. **Open Android Studio**
2. **Tools → AVD Manager**
3. **Create Virtual Device**
4. **Choose**: Pixel 4 or any recent device
5. **System Image**: API 33 (Android 13) or latest
6. **Finish & Start Emulator**

### **4. Alternative: Use Physical Device**
1. **Enable Developer Options** on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. **Enable USB Debugging**:
   - Settings → Developer Options → USB Debugging
3. **Connect via USB** and allow debugging

## 🚀 **Testing the App:**

### **Method 1: Android Studio Direct**
1. **Open Android Studio**
2. **Open Project**: `C:\Users\abhay\OneDrive\Desktop\sam\frontend\GalleryApp\android`
3. **Wait for Gradle sync**
4. **Click the Green Play Button** to run
5. **Select target device** (emulator or connected phone)

### **Method 2: Command Line (After Environment Setup)**
```bash
cd "C:\Users\abhay\OneDrive\Desktop\sam\frontend\GalleryApp"

# Start Metro bundler (if not already running)
npm start

# In another terminal, run the app
npx react-native run-android
```

### **Method 3: Manual APK Install**
```bash
# Build APK
cd android
./gradlew assembleDebug

# Install on device
adb install app/build/outputs/apk/debug/app-debug.apk
```

## 📱 **What to Test:**

### **1. App Launch & Image Loading**
- ✅ App should start and show loading screen
- ✅ 50 sample images should appear in grid layout
- ✅ Progress bar during initial image caching

### **2. Gallery Features**
- ✅ **Scroll through images** - Smooth grid scrolling
- ✅ **Tap image** - Full-screen modal view
- ✅ **Image quality** - High-resolution Picsum images
- ✅ **Image descriptions** - Rich, detailed captions

### **3. Search Functionality**
- ✅ **Search bar** - Type keywords (e.g., "mountain", "food", "animals")
- ✅ **Live results** - Images filter as you type
- ✅ **Clear search** - Return to full gallery

### **4. Upload Tab**
- ✅ **Tab navigation** - Switch between Gallery and Upload
- ✅ **Photo picker** - Select images from device gallery
- ✅ **Upload progress** - Progress indicators during upload
- ✅ **Backend integration** - Images sent to your Node.js server

### **5. Error Handling**
- ✅ **Network errors** - Graceful handling when backend is offline
- ✅ **Permission errors** - Camera/storage permission requests
- ✅ **Loading states** - Proper loading indicators

## 🔍 **Troubleshooting:**

### **Common Issues:**
1. **"adb not found"** → Add Android SDK to PATH
2. **"JAVA_HOME not set"** → Set Java environment variable
3. **"No emulator found"** → Create AVD in Android Studio
4. **"Build failed"** → Check Android SDK version compatibility

### **Debug Commands:**
```bash
# Check environment
npx react-native doctor

# Clear cache
npx react-native start --reset-cache

# Check connected devices
adb devices

# View logs
npx react-native log-android
```

## 🎯 **Expected Result:**
- **Beautiful gallery** with 50 high-quality images
- **Smooth scrolling** and navigation
- **Working search** functionality
- **Upload capability** from device gallery
- **Professional UI** with loading states and error handling

Once environment is set up, the app should run perfectly! 🚀📱

# Android APK Build Analysis - ISP Management System

## Executive Summary

Your previous project successfully built an Android APK using **Capacitor Framework** (v7.4.4), which bridges your React web application with native Android capabilities. This document provides a complete blueprint for replicating this successful setup in your current project.

---

## 1. Framework & Architecture

### Framework Used
- **Capacitor 7.4.4** - Cross-platform app framework that runs web apps on native platforms
- **React 19.2.0** - Web application framework
- **Vite 7.2.5** - Build tool for the web application
- **Gradle 8.7.2** - Android build system

### Why Capacitor?
✅ Single codebase for web and mobile (React → APK)  
✅ Access to native Android features (plugins)  
✅ Simpler than React Native or Expo  
✅ Can deploy as PWA AND as APK  
✅ Offline-first architecture with localStorage  

### Architecture Flow
```
React Web App (src/)
    ↓
Vite Build (npm run build)
    ↓
dist/ (web assets)
    ↓
npx cap sync android
    ↓
android/ (Capacitor Android project)
    ↓
Gradle Build (./gradlew assembleRelease)
    ↓
APK Output (android/app/build/outputs/apk/)
```

---

## 2. Key Configuration Files

### A. `capacitor.config.json`
```json
{
  "appId": "com.hd.management",
  "appName": "شركة HD",
  "webDir": "dist",
  "server": {
    "androidScheme": "https",
    "allowNavigation": ["localhost", "127.0.0.1"]
  },
  "android": {
    "allowMixedContent": true,
    "captureInput": true
  },
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 3000
    }
  }
}
```

**Key Settings:**
- `appId`: Package ID for Android (e.g., com.company.appname)
- `webDir`: Points to dist/ (built web files)
- `allowMixedContent`: Allows HTTP in app
- `SplashScreen`: Shows 3-second splash on startup

---

### B. Build Gradle Files

**Top-level `build.gradle`:**
```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.7.2'
        classpath 'com.google.gms:google-services:4.4.2'
    }
}

apply from: "android/variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}
```

**App-level `android/app/build.gradle`:**
```gradle
android {
    namespace "com.isp.management"
    compileSdk 35
    defaultConfig {
        applicationId "com.isp.management"
        minSdkVersion 23
        targetSdkVersion 35
        versionCode 1
        versionName "1.0"
    }
    signingConfigs {
        release {
            storeFile file("../isp-management.jks")
            storePassword "123456"
            keyAlias "isp-key"
            keyPassword "123456"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
        }
    }
}
```

**Android SDK Versions:**
```gradle
minSdkVersion = 23        # Android 6.0 (Marshmallow)
compileSdkVersion = 35    # Latest Android 15
targetSdkVersion = 35
```

### C. `android/variables.gradle`
```gradle
ext {
    minSdkVersion = 23
    compileSdkVersion = 35
    targetSdkVersion = 35
    androidxActivityVersion = '1.9.2'
    androidxAppCompatVersion = '1.7.0'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.15.0'
    androidxFragmentVersion = '1.8.4'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.12.1'
}
```

### D. `AndroidManifest.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">
        
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation"
            android:launchMode="singleTask"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>
    
    <uses-permission android:name="android.permission.INTERNET" />
</manifest>
```

---

## 3. Build Process - Complete Workflow

### 3.1 Local Build Process (PowerShell Script)

**File: `build-apk.ps1`**
```powershell
param([string]$BuildType = "debug")

Write-Host "Starting Android APK build..." -ForegroundColor Cyan

# Step 1: Build web
Write-Host "Building web app..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { exit 1 }

# Step 2: Sync with Android
Write-Host "Syncing with Android..." -ForegroundColor Yellow
npx cap sync android
if ($LASTEXITCODE -ne 0) { exit 1 }

# Step 3: Build APK
Write-Host "Building APK ($BuildType)..." -ForegroundColor Yellow
cd android

if ($BuildType -eq "release") {
    .\gradlew.bat assembleRelease
} else {
    .\gradlew.bat assembleDebug
}

$apkResult = $LASTEXITCODE
cd ..

if ($apkResult -eq 0) {
    Write-Host "Success! APK built successfully." -ForegroundColor Green
    if ($BuildType -eq "release") {
        Write-Host "APK location: android/app/build/outputs/apk/release/app-release.apk" -ForegroundColor Cyan
    } else {
        Write-Host "APK location: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Cyan
    }
} else {
    Write-Host "Failed to build APK" -ForegroundColor Red
    exit 1
}
```

### 3.2 NPM Scripts (from package.json)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "android:build": "npm run build && npx cap sync android",
    "android:debug": "powershell -File build-apk.ps1 debug",
    "android:release": "powershell -File build-apk.ps1 release",
    "cap:sync": "npx cap sync android",
    "cap:copy": "npx cap copy android",
    "cap:open": "npx cap open android"
  }
}
```

### 3.3 GitHub Actions Workflow

**File: `.github/workflows/build-apk.yml`**
```yaml
name: Build APK

on:
  push:
    branches: [ master ]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '22'

    - name: Setup Java
      uses: actions/setup-java@v3
      with:
        distribution: 'oracle'
        java-version: '21'

    - name: Install dependencies
      run: npm install

    - name: Build React app
      run: npm run build

    - name: Sync Capacitor
      run: npx cap sync android

    - name: Set up Android SDK
      uses: android-actions/setup-android@v2

    - name: Build APK with Gradle
      working-directory: ./android
      run: |
        chmod +x ./gradlew
        ./gradlew clean assembleRelease --stacktrace

    - name: Check APK Output
      run: |
        if [ -f android/app/build/outputs/apk/release/app-release.apk ]; then
          echo "✅ APK built successfully!"
          ls -lh android/app/build/outputs/apk/release/
        else
          echo "❌ APK not found - Build failed"
          exit 1
        fi

    - name: Upload APK to Artifacts
      uses: actions/upload-artifact@v4
      with:
        name: app-release
        path: android/app/build/outputs/apk/release/app-release.apk
        retention-days: 30
```

---

## 4. Installation & Setup Requirements

### 4.1 Environment Requirements

**Local Development Machine:**
1. **Java Development Kit (JDK) 17+**
   - Download: https://www.oracle.com/java/technologies/downloads/
   - Verify: `java -version`

2. **Android SDK**
   - Install via Android Studio: https://developer.android.com/studio
   - Or: Command Line Tools
   - Verify: `adb devices`

3. **Node.js 22+**
   - Download: https://nodejs.org/
   - Verify: `node --version`

4. **Gradle (provided by Capacitor)**
   - Uses: Gradle 8.7.2
   - Included in: `./android/gradle/` directory

### 4.2 Environment Variables

```powershell
# Windows PowerShell - Set these permanently:
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:ANDROID_HOME = "C:\Users\[USERNAME]\AppData\Local\Android\Sdk"

# Or permanently add to System Environment Variables
# Control Panel → System → Advanced → Environment Variables
```

### 4.3 Local Build Configuration

**File: `local.properties`**
```properties
sdk.dir=C:\\Users\\[USERNAME]\\AppData\\Local\\Android\\Sdk
```

This file is **NOT** committed to Git (it's in .gitignore). Each developer must create it locally.

---

## 5. Step-by-Step Build Instructions

### Option 1: Debug APK (for testing)

```powershell
# Method 1: Using npm script (Windows)
npm run android:debug

# Method 2: Manual steps
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleDebug
cd ..

# Output location:
# android/app/build/outputs/apk/debug/app-debug.apk
# File size: ~40-50 MB
```

### Option 2: Release APK (for production)

```powershell
# Method 1: Using npm script (Windows)
npm run android:release

# Method 2: Manual steps
npm run build
npx cap sync android
cd android
.\gradlew.bat assembleRelease
cd ..

# Output location:
# android/app/build/outputs/apk/release/app-release.apk
# File size: ~30-40 MB
```

### Option 3: GitHub Actions (Automated CI/CD)

1. Push code to GitHub (master branch)
2. GitHub Actions automatically:
   - Installs dependencies
   - Builds React app
   - Syncs Capacitor
   - Builds APK
   - Uploads to Artifacts
3. Download APK from: Actions → build → Artifacts → app-release

---

## 6. Signing & Release Configuration

### 6.1 Create Signing Key (One-time setup)

```powershell
# Generate keystore
keytool -genkey -v -keystore isp-management.jks -keyalg RSA -keysize 2048 -validity 10000 -alias isp-key

# You'll be prompted for:
# - Password (keystore)
# - Key password
# - Name, organization, city, state, country
```

### 6.2 Store Credentials Securely

**In `build.gradle` (git-ignored if using .gitignore):**
```gradle
signingConfigs {
    release {
        storeFile file("../isp-management.jks")
        storePassword "your_password"
        keyAlias "isp-key"
        keyPassword "your_password"
    }
}
```

**For GitHub Actions (use Secrets):**
1. Go to: GitHub → Settings → Secrets and variables → Actions
2. Add secrets:
   - `KEYSTORE_BASE64`: Base64-encoded keystore file
   - `KEYSTORE_PASSWORD`: Password
   - `KEY_PASSWORD`: Key password
3. Update workflow to use these secrets

---

## 7. Testing on Device

### 7.1 Setup Device for Testing

```powershell
# 1. Enable Developer Mode
# Settings → About Phone → Build Number (tap 7 times)

# 2. Enable USB Debugging
# Settings → Developer Options → USB Debugging ✓

# 3. Connect device via USB

# 4. Verify connection
adb devices
# Output: [device-id]  device

# 5. Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 6. View logs
adb logcat
adb logcat | Select-String "Error"

# 7. Uninstall app
adb uninstall com.isp.management
```

---

## 8. Dependencies & Versions

### 8.1 Core Dependencies

```json
{
  "dependencies": {
    "@capacitor/core": "^7.4.4",
    "@capacitor/app": "^7.1.0",
    "@capacitor/keyboard": "^7.0.3",
    "@capacitor/splash-screen": "^7.0.3",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-router-dom": "^6.18.0"
  },
  "devDependencies": {
    "@capacitor/android": "^7.4.4",
    "@capacitor/cli": "^7.4.4",
    "vite": "npm:rolldown-vite@7.2.5",
    "@vitejs/plugin-react": "^5.1.1"
  }
}
```

### 8.2 Android Gradle Dependencies

```gradle
dependencies {
    implementation "androidx.appcompat:appcompat:1.7.0"
    implementation "androidx.coordinatorlayout:coordinatorlayout:1.2.0"
    implementation "androidx.core:core-splashscreen:1.0.1"
    implementation project(':capacitor-android')
    implementation "junit:junit:4.13.2"
    androidTestImplementation "androidx.test.ext:junit:1.2.1"
    androidTestImplementation "androidx.test.espresso:espresso-core:3.6.1"
}
```

---

## 9. Project Structure

```
project-root/
├── src/                           # React source code
│   ├── hooks/
│   ├── pages/
│   ├── components/
│   ├── App.jsx
│   └── main.jsx
├── android/                       # Capacitor Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── java/             # Java code
│   │   │   ├── res/              # Resources (icons, layouts)
│   │   │   ├── assets/           # Web files (from dist/)
│   │   │   └── AndroidManifest.xml
│   │   └── build.gradle
│   ├── gradle/
│   ├── build.gradle
│   ├── settings.gradle
│   ├── gradlew                   # Gradle wrapper (Unix)
│   └── gradlew.bat               # Gradle wrapper (Windows)
├── dist/                          # Built web files (generated)
│   ├── index.html
│   └── assets/
├── capacitor.config.json          # Capacitor config
├── package.json
├── build-apk.ps1                  # Build script
├── local.properties               # Local SDK path (not in git)
├── .github/workflows/
│   └── build-apk.yml             # GitHub Actions
└── vite.config.js
```

---

## 10. Common Issues & Solutions

### Issue 1: "Java not found"
```powershell
# Solution:
$env:JAVA_HOME  # Verify it's set
java -version   # Test installation

# If not set:
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
```

### Issue 2: "Android SDK not found"
```powershell
# Solution:
$env:ANDROID_HOME  # Verify it's set
adb devices        # Test installation

# If not set:
$env:ANDROID_HOME = "C:\Users\[USERNAME]\AppData\Local\Android\Sdk"
```

### Issue 3: "APK not found after build"
```powershell
# Check for build errors:
cd android
.\gradlew.bat assembleDebug --stacktrace
cd ..

# Check output location:
Get-ChildItem -Recurse -Filter "*.apk" android/app/build/
```

### Issue 4: "Gradle sync failed"
```powershell
# Solution:
cd android
.\gradlew.bat clean
.\gradlew.bat build --refresh-dependencies
cd ..
```

### Issue 5: "Device not found for testing"
```powershell
# Solution:
adb devices                    # List all devices
adb kill-server               # Restart ADB
adb start-server
adb devices                    # Try again
```

---

## 11. Build Performance Stats

| Metric | Value |
|--------|-------|
| First Build | 2-3 minutes |
| Incremental Build | 30-45 seconds |
| Debug APK Size | 40-50 MB |
| Release APK Size | 30-40 MB |
| Web Modules | 251 |
| Capacitor Modules | +5 |
| Total Modules | 256 |

---

## 12. Migration Steps for Current Project

To replicate this successful setup in your current project:

### Step 1: Install Capacitor
```powershell
npm install @capacitor/core @capacitor/cli @capacitor/android@^7.4.4
npm install @capacitor/app @capacitor/keyboard @capacitor/splash-screen
```

### Step 2: Initialize Capacitor
```powershell
npx cap init "Project Name" "com.company.appname"
npx cap add android
```

### Step 3: Copy Configuration Files
- Copy `capacitor.config.json` structure
- Copy `build-apk.ps1` script
- Copy `.github/workflows/build-apk.yml`
- Copy `android/variables.gradle`

### Step 4: Setup Local Properties
```powershell
# Create android/local.properties
sdk.dir=C:\\Users\\[USERNAME]\\AppData\\Local\\Android\\Sdk
```

### Step 5: Create Signing Key
```powershell
keytool -genkey -v -keystore project.jks -keyalg RSA -keysize 2048 -validity 10000 -alias project-key
```

### Step 6: Update package.json Scripts
```json
{
  "scripts": {
    "android:build": "npm run build && npx cap sync android",
    "android:debug": "powershell -File build-apk.ps1 debug",
    "android:release": "powershell -File build-apk.ps1 release",
    "cap:sync": "npx cap sync android"
  }
}
```

### Step 7: Build & Test
```powershell
npm run build
npm run android:debug
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 13. Key Learnings & Best Practices

✅ **Use Capacitor** for React web-to-mobile bridging  
✅ **Build web first** (npm run build) before Capacitor sync  
✅ **Always sync after code changes** (npx cap sync android)  
✅ **Use environment variables** for Java and Android SDK  
✅ **Test on real devices**, not just emulator  
✅ **Version your signing keys** securely  
✅ **Use GitHub Actions** for automated builds  
✅ **Keep dependencies updated** regularly  
✅ **Monitor build logs** for early error detection  
✅ **Use ProGuard** for release builds to reduce size  

---

## 14. Useful Commands Reference

```powershell
# Building
npm run build                           # Build web app
npm run android:debug                   # Full debug build
npm run android:release                 # Full release build
npm run cap:sync                        # Sync only (after code changes)

# Gradle direct commands
cd android
.\gradlew.bat clean                     # Clean build cache
.\gradlew.bat assembleDebug             # Debug build only
.\gradlew.bat assembleRelease           # Release build only
.\gradlew.bat --stacktrace              # Build with error details
cd ..

# Testing
adb devices                             # List connected devices
adb logcat                              # View device logs
adb install app-debug.apk               # Install APK
adb uninstall com.company.appname       # Uninstall app
adb shell pm clear com.company.appname  # Clear app data

# Capacitor
npx cap open android                    # Open Android Studio
npx cap sync android                    # Sync web files
npx cap copy android                    # Copy only (fast)
```

---

## Summary

Your previous project successfully built an APK using a **Capacitor-based approach** with:
- **React 19 + Vite** for the web app
- **Capacitor 7.4.4** for mobile bridging
- **Gradle 8.7.2** for Android compilation
- **PowerShell scripts** for local automation
- **GitHub Actions** for CI/CD

This is a proven, production-ready approach that you can replicate in your current project by following the migration steps above.


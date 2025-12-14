# Build Android APK Script
# This script builds the APK from the React app

Write-Host "=== Building Android APK ===" -ForegroundColor Green

# Step 1: Build the web app
Write-Host "Step 1: Building web app..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Web build failed!" -ForegroundColor Red
    exit 1
}

# Step 2: Sync to Android
Write-Host "Step 2: Syncing to Android..." -ForegroundColor Cyan
npx cap sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

# Step 3: Build Debug APK
Write-Host "Step 3: Building Debug APK..." -ForegroundColor Cyan
cd android
./gradlew assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "Android build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "APK built successfully!" -ForegroundColor Green
Write-Host "Debug APK: android/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Yellow
cd ..

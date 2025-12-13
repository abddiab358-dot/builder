# إعداد Capacitor للـ Android APK

## 📋 المتطلبات

### محلياً (Windows/Mac)
- **Node.js**: 20+ (تم اختباره مع 20.x)
- **Java JDK**: 17+ (ضروري لـ Gradle)
  ```powershell
  # تحقق من التثبيت
  java -version
  ```
- **Android SDK**: عبر Android Studio
  - **Minimum SDK**: 23 (Android 6.0)
  - **Target SDK**: 35 (Android 15)
  - **Compile SDK**: 35

### متغيرات البيئة المطلوبة
```powershell
# على Windows - أضفها إلى System Environment Variables
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Java\jdk-17", "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\[YourUsername]\AppData\Local\Android\Sdk", "User")
[System.Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", "C:\Users\[YourUsername]\AppData\Local\Android\Sdk", "User")
```

## 🚀 البدء السريع

### 1. التثبيت الأول
```bash
# ثبت جميع Dependencies
npm install

# أنشئ مشروع Android (مرة واحدة فقط)
npx cap add android
```

### 2. تطوير محلي
```bash
# بناء التطبيق الويب
npm run build

# مزامنة مع Android
npm run cap:sync

# فتح Android Studio
npm run cap:open
```

### 3. بناء APK

#### Debug APK (للاختبار)
```bash
npm run android:debug
# يتم إنشاء: android/app/build/outputs/apk/debug/app-debug.apk (~50 MB)
```

#### Release APK (للإطلاق)
```bash
npm run android:release
# يتم إنشاء: android/app/build/outputs/apk/release/app-release-unsigned.apk (~35 MB)
```

## 📁 هيكل المشروع

```
برنامج المقاولات/
├── src/                    # كود React
├── dist/                   # مخرجات البناء (يزامن مع Android)
├── android/                # مشروع Android الكامل
│   ├── app/
│   │   ├── build/         # مجلد البناء (فيه APK)
│   │   ├── src/
│   │   └── build.gradle   # إعدادات البناء
│   ├── build.gradle
│   └── settings.gradle
├── capacitor.config.json   # إعدادات Capacitor
├── build-apk.ps1          # سكريبت بناء PowerShell
├── package.json           # Dependencies وScripts
└── .github/workflows/
    └── build-android.yml  # GitHub Actions CI/CD
```

## ⚙️ ملفات الإعدادات الرئيسية

### capacitor.config.json
يحتوي على:
- `appId`: معرف التطبيق الفريد (مثل: com.contractorapp.mobile)
- `appName`: اسم التطبيق
- `webDir`: مسار ملفات الويب المراد نزامجتها
- `plugins`: تكوين البلاجينات (SplashScreen, StatusBar, etc)

### android/app/build.gradle
يحتوي على:
- `minSdkVersion`: الحد الأدنى لإصدار Android (23)
- `targetSdkVersion`: الإصدار المستهدف (35)
- `compileSdkVersion`: الإصدار المستخدم في الترجمة (35)

## 🔧 الأوامر المتاحة

| الأمر | الوصف |
|------|-------|
| `npm run dev` | بدء خادم التطوير |
| `npm run build` | بناء التطبيق الويب |
| `npm run cap:sync` | مزامنة مع Android |
| `npm run cap:open` | فتح Android Studio |
| `npm run android:debug` | بناء Debug APK |
| `npm run android:release` | بناء Release APK |
| `npm run lint` | التحقق من الأخطاء |

## 📦 توزيع APK

### على GitHub Releases
```bash
# سيتم تحميل APK تلقائياً عند push إلى main
# يمكنك تحميله من: https://github.com/abddiab358-dot/builder/releases
```

### يدويًا على جهازك
```bash
# بعد بناء APK، ستجده في:
android/app/build/outputs/apk/debug/app-debug.apk

# انقل الملف وثبّته على جهازك:
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## 🐛 استكشاف الأخطاء

### خطأ: `java -version` لم يعمل
**الحل**: تأكد من تثبيت Java JDK (وليس JRE) وتعيين JAVA_HOME

### خطأ: `Android SDK not found`
**الحل**: 
```powershell
# تأكد من أن Android SDK مثبت
ls "C:\Users\[YourUsername]\AppData\Local\Android\Sdk"

# أعد تعيين ANDROID_HOME
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\...\Sdk", "User")
```

### خطأ: `Gradle build failed`
**الحل**: 
```bash
# نظف ملفات الكاش
cd android
./gradlew clean

# أعد المحاولة
./gradlew assembleDebug
```

### خطأ: Port 5173 مشغول
**الحل**:
```bash
npm run dev -- --port 5174
```

## 📚 المراجع

- [Capacitor Documentation](https://capacitorjs.com/)
- [Android Developers Guide](https://developer.android.com/)
- [Gradle Build System](https://gradle.org/)

## ✅ قائمة التحقق قبل الإطلاق

- [ ] Java JDK 17+ مثبت
- [ ] Android SDK مثبت (API Level 35)
- [ ] متغيرات البيئة معرّفة بشكل صحيح
- [ ] اختبار Debug APK على جهاز فعلي أو محاكي
- [ ] اختبار جميع الوظائف الأساسية
- [ ] بناء Release APK
- [ ] اختبار Release APK
- [ ] إضافة توقيع رقمي (اختياري للـ Play Store)

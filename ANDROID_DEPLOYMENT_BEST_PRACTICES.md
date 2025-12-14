# Android Deployment على GitHub Actions - أفضل الممارسات

**مستند يوثق أفضل الممارسات بناءً على تجربة بناء تطبيق المقاولات.**

---

## 🔴 المشاكل التي واجهناها والحلول

### 1. **خطأ Node.js Version المتطلبة**
**الخطأ:**
```
The Capacitor CLI requires NodeJS >=22.0.0
```

**السبب:** Capacitor 8.x+ يتطلب Node 22 الحد الأدنى.

**الحل:**
```yaml
# في .github/workflows/build.yml
- name: Set up Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '22.x'  # ✅ يجب أن تكون 22.x على الأقل
    cache: 'npm'
```

**النقطة الحرجة:** تحديث **جميع** workflow files التي تشغّل `npx cap sync android`

---

### 2. **خطأ Java Version في Gradle**
**الخطأ:**
```
Execution failed for task ':capacitor-android:compileDebugJavaWithJavac'
> Java compilation initialization error: invalid source release: 21
```

**السبب:** Capacitor 8.x يفرض Java 21 في `node_modules/@capacitor/android/capacitor/build.gradle`، بينما GitHub Actions توفر Java 17.

**الحل - الخيار الأفضل:**
أضف override عام في `android/build.gradle`:

```gradle
// android/build.gradle
allprojects {
    repositories {
        google()
        mavenCentral()
    }
    
    // ✅ Override Java version لكل المكتبات (يشمل Capacitor)
    afterEvaluate {
        if (plugins.hasPlugin('com.android.library') || plugins.hasPlugin('com.android.application')) {
            android {
                compileOptions {
                    sourceCompatibility JavaVersion.VERSION_17
                    targetCompatibility JavaVersion.VERSION_17
                }
            }
        }
    }
}
```

**لماذا هذا أفضل:**
- ✅ يعمل مع جميع مكتبات Android (Capacitor, Cordova plugins, etc.)
- ✅ لا تحتاج تحديث كل ملف gradle على انفراد
- ✅ يتغلب على المشاكل المستقبلية من المكتبات الجديدة

**الخيارات الأخرى (أقل كفاءة):**
```gradle
// ❌ تحديث app/capacitor.build.gradle (محدود لـ app فقط)
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

// ❌ تحديث كل مكتبة على انفراد (تكرار)
```

---

### 3. **Java Version Setup في GitHub Actions**
**التكوين الموصى به:**

```yaml
# في .github/workflows/build-android.yml
- name: Set up Java
  uses: actions/setup-java@v4
  with:
    java-version: '17'       # ✅ LTS stable version
    distribution: 'temurin'  # Modern JDK distribution
```

---

## 🎯 Checklist للمشاريع الجديدة

### عند إنشاء مشروع Capacitor + Android جديد:

- [ ] **Node.js في workflow:** استخدم `node-version: '22.x'`
- [ ] **Java في workflow:** استخدم `java-version: '17'` و `distribution: 'temurin'`
- [ ] **Gradle override:** أضف `compileOptions` override في `android/build.gradle` الرئيسي
- [ ] **Capacitor version:** استخدم `^8.0.0` على الأقل
- [ ] **تجنب:** عدم تعديل ملفات generated (مثل `app/capacitor.build.gradle`) لأنها تُعاد توليدها

---

## 📦 هيكل المشروع الموصى به

```
android/
├── build.gradle              # ✅ ضع overrides هنا (عام لكل المكتبات)
├── app/
│   ├── build.gradle
│   └── capacitor.build.gradle # ❌ تجنب تعديل مباشر
├── capacitor-cordova-android-plugins/ # يُولّد تلقائياً
└── gradle.properties
```

---

## 🔧 Configuration الموصى به

### `android/variables.gradle`
```gradle
ext {
    minSdkVersion = 24          # Android 7.0+
    compileSdkVersion = 36      # Latest stable
    targetSdkVersion = 36
}
```

### `package.json` (Capacitor)
```json
{
  "dependencies": {
    "@capacitor/android": "^8.0.0",
    "@capacitor/cli": "^8.0.0",
    "@capacitor/core": "^8.0.0"
  }
}
```

---

## 🚀 خطوات البناء الموصى بها في CI

```yaml
jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.x'
          cache: 'npm'
      
      - name: Set up Java
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build web app
        run: npm run build
      
      - name: Sync to Capacitor
        run: npx cap sync android
      
      - name: Build Android
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug --no-daemon
      
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: apk
          path: android/app/build/outputs/apk/
```

---

## ⚠️ تجنب هذه الأخطاء

| الخطأ | السبب | الحل |
|------|------|------|
| `nodeJS >= 22 required` | Node قديم في CI | استخدم `22.x` |
| `invalid source release: 21` | Java version mismatch | استخدم override في `build.gradle` |
| `./gradlew permission denied` | ملف لم يُجعل executable | أضف `chmod +x gradlew` |
| `capacitor.plugins.json not found` | لم تشغل `npx cap sync` | اضمن `sync` قبل build |
| `Cannot find symbol` | gradle cache قديم | أضف `--no-daemon` و `clean` |

---

## 📚 مصادر مهمة

- [Capacitor Documentation](https://capacitorjs.com/docs/android)
- [Android Gradle Plugin Guide](https://developer.android.com/build)
- [GitHub Actions Java Setup](https://github.com/actions/setup-java)

---

**تم توثيقه:** December 14, 2025  
**المشروع:** برنامج المقاولات  
**الإصدار:** Android APK Build on GitHub Actions v1.0

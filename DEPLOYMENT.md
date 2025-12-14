## 🚀 نشر التطبيق على الويب

يمكنك نشر هذا التطبيق مجاناً على عدة منصات:

### 1️⃣ نشر سهل: Vercel (الموصى به)

#### الخطوات:
1. اذهب إلى [vercel.com](https://vercel.com)
2. انقر **New Project**
3. اختر مستودعك من GitHub: `abddiab358-dot/builder`
4. Vercel سيكتشف تلقائياً أنه مشروع Vite
5. انقر **Deploy**
6. انتظر 2-3 دقائق للنشر

**المميزات:**
- نشر تلقائي عند كل push على GitHub
- نطاق مجاني: `builder.vercel.app`
- دعم SSL مجاني
- أداء عالي جداً

---

### 2️⃣ GitHub Pages

#### الخطوات:
1. أضف الكود التالي في `vite.config.js`:
```javascript
export default {
  base: '/builder/',  // اسم المستودع
  // ... باقي الإعدادات
}
```

2. في GitHub:
   - اذهب إلى **Settings**
   - اختر **Pages**
   - تحت "Source" اختر **GitHub Actions**
   - الـ Actions ستقوم بالنشر تلقائياً

**المميزات:**
- مجاني تماماً
- النطاق: `abddiab358-dot.github.io/builder`
- بطيء قليلاً من Vercel

---

### 3️⃣ Netlify

#### الخطوات:
1. اذهب إلى [netlify.com](https://netlify.com)
2. انقر **Add new site** → **Import an existing project**
3. اختر GitHub واختر المستودع
4. النطاق: `builder-app.netlify.app`

**المميزات:**
- نشر تلقائي
- أداء جيدة
- دعم Functions مجاني

---

### 4️⃣ Firebase Hosting (Google)

#### الخطوات:
```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# إنشاء مشروع Firebase
firebase init hosting

# البناء والنشر
npm run build
firebase deploy
```

**المميزات:**
- النطاق: `builder-xyz.firebaseapp.com`
- CDN سريع
- دعم Firebase لاحقاً

---

## 📋 المتطلبات قبل النشر

✅ **تحقق من:**
- [ ] البناء ينجح: `npm run build`
- [ ] لا توجد أخطاء: `npm run build` يُظهر 0 errors
- [ ] جميع الكود محمّل على GitHub
- [ ] ملف `.gitignore` يستثني `node_modules` و `dist`

---

## 🔑 المتغيرات البيئية

إذا كنت تستخدم مفاتيح API (مثل Google Drive):

1. في مشروعك، أنشئ ملف `.env.local`:
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

2. في منصة النشر (Vercel/Netlify):
   - اذهب إلى **Settings** → **Environment Variables**
   - أضف المتغيرات

---

## ✨ بعد النشر

### تفعيل CI/CD الإضافي:

GitHub Actions موجود بالفعل (`.github/workflows/build-deploy.yml`)

لإضافة نشر تلقائي إلى Vercel:
1. أنشئ account على Vercel
2. اذهب إلى Settings → Tokens
3. انسخ الـ token
4. في GitHub → Settings → Secrets → Add:
   - Name: `VERCEL_TOKEN`
   - Value: الـ token

---

## 🎯 أفضل الخيارات

| المنصة | السرعة | السعر | البساطة |
|--------|-------|------|--------|
| **Vercel** | ⭐⭐⭐⭐⭐ | مجاني | ⭐⭐⭐⭐⭐ |
| Netlify | ⭐⭐⭐⭐ | مجاني | ⭐⭐⭐⭐⭐ |
| GitHub Pages | ⭐⭐⭐ | مجاني | ⭐⭐⭐⭐ |
| Firebase | ⭐⭐⭐⭐ | مجاني | ⭐⭐⭐ |

**التوصية:** استخدم **Vercel** - الأسهل والأسرع!

---

## 🔗 روابط مفيدة

- [Vercel Docs](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Actions](https://github.com/features/actions)


# 🚂 نشر المشروع على Railway

## الخطوة 1: إعداد قاعدة بيانات MongoDB

### الخيار أ: استخدام MongoDB Atlas (مجاني)

1. انتقل إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ حساب جديد أو سجّل الدخول
3. أنشئ Cluster جديد (اختر الخطة المجانية M0)
4. انتقر على "Connect"
5. اختر "Connect your application"
6. انسخ رابط الاتصال مثل:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecole-chebbi?retryWrites=true&w=majority
   ```
7. في "Network Access"، أضف `0.0.0.0/0` للسماح بالوصول من جميع عناوين IP

### الخيار ب: استخدام Railway MongoDB (موصى به)

1. في Railway، أضف خدمة MongoDB من Marketplace
2. سيتم إنشاء `MONGO_URL` تلقائياً

---

## الخطوة 2: تحديث ملف .env

```env
# Railway MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecole-chebbi

# أو استخدم المتغير من Railway
MONGODB_URI=${{MONGO_URL}}

PORT=3000
SESSION_SECRET=your-very-secret-key-change-this-in-production
MAX_FILE_SIZE=10485760

# بيانات المدير
ADMIN_EMAIL=admin@ecole-chebbi.tn
ADMIN_PASSWORD=change-this-password
```

---

## الخطوة 3: النشر على Railway

### 3.1 إنشاء مشروع جديد

1. انتقل إلى [Railway.app](https://railway.app/)
2. سجّل الدخول بحساب GitHub
3. اضغط "New Project"
4. اختر "Deploy from GitHub repo"
5. اختر مستودعك

### 3.2 إضافة المتغيرات البيئية

في إعدادات المشروع في Railway، أضف:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecole-chebbi
SESSION_SECRET=your-secret-key-min-32-characters-long
NODE_ENV=production
ADMIN_EMAIL=admin@ecole-chebbi.tn
ADMIN_PASSWORD=secure-password-here
```

### 3.3 إضافة ملف railway.json (اختياري)

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## الخطوة 4: تكوين package.json للإنتاج

تأكد من وجود:

```json
{
  "scripts": {
    "start": "node src/app.js",
    "build": "npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css"
  },
  "engines": {
    "node": ">=18.x"
  }
}
```

---

## الخطوة 5: رفع الملفات إلى GitHub

```bash
git init
git add .
git commit -m "Initial commit - Ecole Abou Elkacem Chebbi"
git branch -M main
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

---

## الخطوة 6: إنشاء حساب المدير

بعد النشر، استخدم Railway CLI أو Console:

```bash
railway run node createAdmin.js
```

أو من Console في Railway، شغّل:
```bash
node createAdmin.js
```

---

## 📝 ملاحظات مهمة

### الأمان
- ✅ غيّر `SESSION_SECRET` إلى نص عشوائي طويل
- ✅ غيّر كلمة مرور المدير
- ✅ لا ترفع ملف `.env` إلى GitHub

### ملفات يجب تجاهلها (.gitignore)
```
node_modules/
.env
uploads/*
!uploads/.gitkeep
public/css/output.css
*.log
.DS_Store
```

### المجلدات الثابتة
تأكد من إنشاء ملفات `.gitkeep` في:
- `uploads/lessons/.gitkeep`
- `uploads/profile-pics/.gitkeep`

---

## 🔍 استكشاف الأخطاء

### خطأ في الاتصال بقاعدة البيانات
- تحقق من صحة `MONGODB_URI`
- تأكد من إضافة `0.0.0.0/0` في Network Access
- تحقق من اسم المستخدم وكلمة المرور

### خطأ في بناء CSS
أضف أمر البناء في إعدادات Railway:
```
npm install && npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css
```

### مشكلة في رفع الملفات
Railway يوفر مساحة تخزين مؤقتة. للملفات الدائمة، استخدم:
- Cloudinary (للصور)
- AWS S3
- Railway Volumes

---

## ✅ التحقق من النشر

بعد النشر بنجاح:

1. افتح رابط التطبيق من Railway
2. تحقق من الصفحة الرئيسية
3. سجّل دخول بحساب المدير
4. جرّب رفع درس

---

**🎉 مبروك! تطبيقك الآن على الإنترنت!**

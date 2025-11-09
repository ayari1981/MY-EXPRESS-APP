# دليل حل المشاكل - خطوة بخطوة

## 1. تسجيل الدخول

### اختبار حساب المسؤول:
```bash
node scripts/test_login.js
```

### تسجيل الدخول يدوياً:
1. افتح: http://localhost:3000/auth/login
2. استخدم:
   - **البريد:** `admin@ecole-chebbi.tn`
   - **كلمة المرور:** `admin123`

### إذا لم ينجح:
```bash
# احذف جدول sessions وأعد التشغيل
node -e "require('./src/config/database').sequelize.query('DROP TABLE IF EXISTS sessions')"
npm start
```

---

## 2. الإشعارات

### اختبار النظام:
```bash
node scripts/test_notifications.js
```

### إرسال إشعار يدوياً:
1. سجّل دخول كأستاذ
2. اذهب إلى: `/teacher/send-notification`
3. اختر:
   - **النوع:** قسم كامل
   - **القسم:** اختر قسم موجود
   - **العنوان:** "اختبار"
   - **الرسالة:** "رسالة تجريبية"
4. اضغط **إرسال**

### التحقق من وصول الإشعار:
1. سجّل دخول كتلميذ في نفس القسم
2. اذهب إلى: `/student/notifications`
3. يجب أن ترى الإشعار

### إذا لم تصل الإشعارات:
**المشكلة:** التلاميذ ليس لديهم `studentClass` محدد

**الحل:**
```sql
-- في قاعدة البيانات، حدّث التلاميذ:
UPDATE users 
SET student_class = '7 أساسي' 
WHERE role = 'student' AND student_class IS NULL;
```

**أو استخدم:**
```bash
node -e "
const { User } = require('./src/models');
User.update(
  { studentClass: '7 أساسي' },
  { where: { role: 'student', studentClass: null } }
).then(() => console.log('تم التحديث'));
"
```

---

## 3. رفع الدروس

### المشكلة الحالية:
- ✅ **محلياً:** المجلدات تُنشأ تلقائياً
- ❌ **على Railway:** الملفات تُحذف عند إعادة النشر

### الحل المؤقت (للاختبار):
1. ارفع درس جديد بعد آخر نشر على Railway
2. الدرس سيعمل حتى إعادة النشر التالية

### الحل الدائم:
**استخدام Cloudinary (تخزين سحابي)**

1. سجّل في: https://cloudinary.com (مجاني)
2. احصل على:
   - Cloud Name
   - API Key
   - API Secret
3. أخبرني وسأساعدك في التكامل

---

## 4. على Railway

### التحقق من المتغيرات:
1. افتح Railway → Web Service → Variables
2. تأكد من وجود:
   ```
   MYSQL_URL=mysql://root:SWRw...@metro.proxy.rlwy.net:51425/railway
   SESSION_SECRET=d0eb6f49d2...
   ```

### التحقق من السجلات:
1. افتح Railway → Logs
2. ابحث عن:
   - ✅ `MySQL متصل بنجاح`
   - ✅ `تم مزامنة النماذج`
   - ❌ أي أخطاء

---

## 5. الاختبار الكامل

### محلياً:
```bash
# 1. أوقف الخادم
Get-Process -Name node | Stop-Process -Force

# 2. شغّل
npm start

# 3. افتح المتصفح
http://localhost:3000

# 4. سجّل دخول
admin@ecole-chebbi.tn / admin123
```

### على Railway:
1. احصل على الرابط من Railway → Settings → Generate Domain
2. افتح الرابط
3. سجّل دخول

---

## أخبرني بالضبط:
1. **ما الذي لا يعمل؟** (تسجيل دخول / إشعارات / رفع دروس)
2. **أين لا يعمل؟** (محلياً / على Railway)
3. **ما الخطأ الذي يظهر؟** (لقطة شاشة أو نص الخطأ)

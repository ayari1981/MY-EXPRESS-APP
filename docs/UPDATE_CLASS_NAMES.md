# تحديث أسماء السنوات الدراسية

## التغييرات المطبقة

تم تحديث أسماء السنوات الدراسية في النظام من:
- ❌ السنة الأولى → ✅ السابعة أساسي
- ❌ السنة الثانية → ✅ الثامنة أساسي
- ❌ السنة الثالثة → ✅ التاسعة أساسي
- ❌ السنة الرابعة → ✅ (محذوفة)

## الملفات المحدثة

### 1. Models (النماذج)
- ✅ `src/models/Lesson.js` - تحديث ENUM للأقسام

### 2. Views (الواجهات)
- ✅ `views/auth/register.ejs` - صفحة التسجيل
- ✅ `views/teacher/upload.ejs` - صفحة رفع الدروس
- ✅ `views/student/profile.ejs` - صفحة الملف الشخصي
- ✅ `views/teacher/send-notification.ejs` - صفحة إرسال الإشعارات

### 3. Database (قاعدة البيانات)
- ✅ `database.sql` - تحديث البنية الأساسية
- ✅ `update_class_names.sql` - سكريبت التحديث (جديد)

## خطوات تطبيق التحديث على قاعدة البيانات

### الطريقة 1: باستخدام Railway Dashboard
1. افتح Railway Dashboard
2. اذهب إلى قاعدة البيانات MySQL
3. افتح Query Console
4. انسخ محتوى ملف `update_class_names.sql`
5. قم بتشغيل السكريبت

### الطريقة 2: باستخدام MySQL CLI
```bash
# الاتصال بقاعدة البيانات
mysql -h metro.proxy.rlwy.net -P 51425 -u root -p railway

# تشغيل السكريبت
source update_class_names.sql;
```

### الطريقة 3: من VS Code
1. افتح ملف `update_class_names.sql`
2. انسخ محتوياته
3. استخدم MySQL Extension أو أداة الاتصال بقاعدة البيانات
4. نفذ السكريبت

## التأثير على البيانات الموجودة

### التلاميذ
- سيتم تحديث جميع أقسام التلاميذ تلقائياً
- السنة الرابعة → التاسعة أساسي

### الدروس
- سيتم تحديث جميع الدروس المرفوعة
- السنة الرابعة → التاسعة أساسي

### الإشعارات
- الإشعارات السابقة لن تتأثر
- الإشعارات الجديدة ستستخدم الأسماء الجديدة

## التحقق من نجاح التحديث

بعد تشغيل السكريبت، تحقق من:

```sql
-- التحقق من أقسام التلاميذ
SELECT DISTINCT student_class, COUNT(*) as count 
FROM users 
WHERE role = 'student' 
GROUP BY student_class;

-- التحقق من أقسام الدروس
SELECT DISTINCT class, COUNT(*) as count 
FROM lessons 
GROUP BY class;
```

يجب أن ترى فقط:
- السابعة أساسي
- الثامنة أساسي
- التاسعة أساسي

## إعادة تشغيل الخادم

بعد تطبيق التحديثات:

```bash
# إيقاف الخادم (Ctrl+C)
# ثم تشغيله من جديد
node src/app.js
```

## ملاحظات مهمة

⚠️ **تحذير**: قم بعمل نسخة احتياطية من قاعدة البيانات قبل تنفيذ التحديث

```bash
# نسخ احتياطي من قاعدة البيانات
mysqldump -h metro.proxy.rlwy.net -P 51425 -u root -p railway > backup_before_update.sql
```

## استعادة النظام القديم (في حالة الحاجة)

إذا أردت العودة للنظام القديم:

```sql
-- عكس التحديثات
UPDATE users SET student_class = 'السنة الأولى' WHERE student_class = 'السابعة أساسي';
UPDATE users SET student_class = 'السنة الثانية' WHERE student_class = 'الثامنة أساسي';
UPDATE users SET student_class = 'السنة الثالثة' WHERE student_class = 'التاسعة أساسي';

UPDATE lessons SET class = 'السنة الأولى' WHERE class = 'السابعة أساسي';
UPDATE lessons SET class = 'السنة الثانية' WHERE class = 'الثامنة أساسي';
UPDATE lessons SET class = 'السنة الثالثة' WHERE class = 'التاسعة أساسي';

ALTER TABLE lessons 
MODIFY COLUMN class ENUM('السنة الأولى', 'السنة الثانية', 'السنة الثالثة', 'السنة الرابعة') NOT NULL;
```

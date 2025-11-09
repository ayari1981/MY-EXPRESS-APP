# ميزة إدارة الجداول الدراسية

## نظرة عامة
تم إضافة ميزة كاملة لإدارة جداول الأوقات للتلاميذ والأساتذة. يمكن للمدير رفع وتعديل الجداول، ويمكن للجميع تحميلها.

## المميزات المضافة

### 1. للمدير (Admin)
- ✅ رفع جداول جديدة (PDF, DOCX, XLSX, JPG, PNG)
- ✅ تعديل الجداول الموجودة
- ✅ حذف الجداول
- ✅ تحديد نوع الجدول (تلاميذ أو أساتذة)
- ✅ تحديد القسم المستهدف (سابعة/ثامنة/تاسعة/جميع الأقسام)
- ✅ تفعيل/إلغاء تفعيل الجداول
- ✅ إحصائيات التحميلات

### 2. للتلاميذ (Students)
- ✅ عرض الجداول الخاصة بقسمهم
- ✅ تحميل الجداول
- ✅ واجهة بسيطة وجذابة
- ✅ رابط سريع من لوحة التحكم

### 3. للمدرسين (Teachers)
- ✅ عرض جميع جداول الأساتذة
- ✅ تحميل الجداول
- ✅ واجهة احترافية
- ✅ رابط سريع من لوحة التحكم

## الملفات المضافة/المعدلة

### Models (النماذج)
- ✅ `src/models/Schedule.js` - نموذج الجداول (جديد)
- ✅ `src/models/index.js` - إضافة Schedule

### Routes (المسارات)
- ✅ `src/routes/admin.js` - إضافة مسارات إدارة الجداول
- ✅ `src/routes/student.js` - إضافة مسارات عرض/تحميل الجداول
- ✅ `src/routes/teacher.js` - إضافة مسارات عرض/تحميل الجداول

### Views (الواجهات)
**للمدير:**
- ✅ `views/admin/schedules.ejs` - قائمة الجداول
- ✅ `views/admin/schedule-upload.ejs` - رفع جدول جديد
- ✅ `views/admin/schedule-edit.ejs` - تعديل جدول
- ✅ `views/admin/dashboard.ejs` - إضافة رابط الجداول

**للتلاميذ:**
- ✅ `views/student/schedules.ejs` - عرض الجداول
- ✅ `views/student/dashboard.ejs` - إضافة رابط الجداول

**للمدرسين:**
- ✅ `views/teacher/schedules.ejs` - عرض الجداول
- ✅ `views/teacher/dashboard.ejs` - إضافة رابط الجداول

### Database (قاعدة البيانات)
- ✅ `create_schedules_table.sql` - سكريبت إنشاء الجدول

### Directories (المجلدات)
- ✅ `uploads/schedules/` - مجلد تخزين الجداول

## خطوات التفعيل

### 1. إنشاء جدول قاعدة البيانات

قم بتشغيل السكريبت على قاعدة البيانات Railway:

```sql
-- من Railway Dashboard > MySQL > Query
-- أو من MySQL CLI
CREATE TABLE IF NOT EXISTS schedules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  class_level ENUM('السابعة أساسي', 'الثامنة أساسي', 'التاسعة أساسي', 'جميع الأقسام') NOT NULL,
  schedule_type ENUM('تلاميذ', 'أساتذة') NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type ENUM('pdf', 'docx', 'doc', 'xlsx', 'jpg', 'png') NOT NULL,
  file_size INT,
  downloads INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_class_level (class_level),
  INDEX idx_schedule_type (schedule_type),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 2. إعادة تشغيل الخادم

```bash
# إيقاف الخادم (Ctrl+C)
# ثم إعادة التشغيل
node src/app.js
```

### 3. التحقق من عمل الميزة

1. سجل الدخول كمدير
2. اذهب إلى "إدارة الجداول" من لوحة التحكم
3. قم برفع جدول تجريبي
4. سجل الدخول كتلميذ وتحقق من ظهور الجدول
5. سجل الدخول كمدرس وتحقق من الجداول

## استخدام الميزة

### كمدير:

**رفع جدول جديد:**
1. لوحة التحكم → إدارة الجداول
2. اضغط "رفع جدول جديد"
3. املأ البيانات:
   - العنوان (مثال: جدول أوقات السابعة أساسي)
   - الوصف (اختياري)
   - نوع الجدول (تلاميذ/أساتذة)
   - القسم المستهدف
   - اختر الملف
4. اضغط "رفع الجدول"

**تعديل جدول:**
1. من قائمة الجداول، اضغط أيقونة التعديل
2. عدل البيانات أو استبدل الملف
3. احفظ التعديلات

**حذف جدول:**
1. من قائمة الجداول، اضغط أيقونة الحذف
2. أكد الحذف

### كتلميذ:

1. لوحة التحكم → الجداول الدراسية
2. شاهد الجداول الخاصة بقسمك
3. اضغط "تحميل الجدول" لتحميل أي جدول

### كمدرس:

1. لوحة التحكم → عرض الجداول
2. شاهد جميع جداول الأساتذة
3. اضغط "تحميل الجدول" لتحميل أي جدول

## الأنواع المسموحة

- **PDF** (.pdf) - مفضل للجودة العالية
- **Word** (.docx, .doc)
- **Excel** (.xlsx, .xls)
- **صور** (.jpg, .jpeg, .png)

**الحد الأقصى للملف:** 10MB

## الأقسام المتاحة

- السابعة أساسي
- الثامنة أساسي
- التاسعة أساسي
- جميع الأقسام (للجداول المشتركة)

## المسارات (Routes)

### مسارات المدير:
- `GET /admin/schedules` - عرض جميع الجداول
- `GET /admin/schedules/upload` - صفحة رفع جدول
- `POST /admin/schedules/upload` - رفع جدول جديد
- `GET /admin/schedules/edit/:id` - صفحة تعديل جدول
- `POST /admin/schedules/edit/:id` - تحديث جدول
- `POST /admin/schedules/delete/:id` - حذف جدول
- `GET /admin/schedules/download/:id` - تحميل جدول

### مسارات التلميذ:
- `GET /student/schedules` - عرض الجداول
- `GET /student/schedules/download/:id` - تحميل جدول

### مسارات المدرس:
- `GET /teacher/schedules` - عرض الجداول
- `GET /teacher/schedules/download/:id` - تحميل جدول

## بنية الجدول (Database Schema)

```javascript
{
  id: Integer (Primary Key),
  title: String(200),
  description: Text,
  classLevel: Enum('السابعة أساسي', 'الثامنة أساسي', 'التاسعة أساسي', 'جميع الأقسام'),
  scheduleType: Enum('تلاميذ', 'أساتذة'),
  fileUrl: String(500),
  fileName: String(255),
  fileType: Enum('pdf', 'docx', 'doc', 'xlsx', 'jpg', 'png'),
  fileSize: Integer,
  downloads: Integer (default: 0),
  isActive: Boolean (default: true),
  uploadedBy: Integer (Foreign Key → users.id),
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## الإحصائيات

- عدد التحميلات لكل جدول
- تاريخ الرفع
- حالة الجدول (نشط/غير نشط)
- نوع الملف وحجمه

## الأمان

- ✅ التحقق من نوع الملف قبل الرفع
- ✅ حد أقصى لحجم الملف (10MB)
- ✅ التحقق من صلاحيات المستخدم
- ✅ التلاميذ يرون فقط جداول قسمهم
- ✅ المدرسون يرون فقط جداول الأساتذة
- ✅ المدير يتحكم في كل شيء

## نصائح الاستخدام

### للمدير:
- استخدم أسماء واضحة للجداول (مثال: "جدول السابعة أساسي - الفصل الأول 2024")
- استخدم صيغة PDF للحصول على أفضل جودة
- فعّل الجداول الحالية فقط وأخفِ القديمة
- راقب إحصائيات التحميل

### للتلاميذ والمدرسين:
- احتفظ بنسخة من الجدول على جهازك
- راجع الجداول بانتظام للتحقق من التحديثات
- تواصل مع الإدارة في حالة وجود خطأ

## استكشاف الأخطاء

### الجدول لا يظهر للتلاميذ:
- تحقق من أن الجدول نشط (is_active = true)
- تحقق من نوع الجدول (يجب أن يكون "تلاميذ")
- تحقق من القسم المستهدف

### خطأ عند رفع الملف:
- تحقق من حجم الملف (أقل من 10MB)
- تحقق من نوع الملف (PDF, DOCX, XLSX, JPG, PNG فقط)
- تحقق من صلاحيات مجلد uploads/schedules

### لا يمكن تحميل الجدول:
- تحقق من وجود الملف في مجلد uploads/schedules
- تحقق من صلاحيات القراءة للملف

## التحديثات المستقبلية (اقتراحات)

- [ ] إضافة إشعارات عند رفع جدول جديد
- [ ] إمكانية تحميل عدة جداول مرة واحدة
- [ ] أرشيف للجداول القديمة
- [ ] إمكانية البحث في الجداول
- [ ] معاينة الجدول قبل التحميل
- [ ] تقييمات وتعليقات على الجداول

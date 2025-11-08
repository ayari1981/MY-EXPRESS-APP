-- سكريبت تحديث أسماء السنوات الدراسية
-- من: السنة الأولى/الثانية/الثالثة/الرابعة
-- إلى: السابعة أساسي/الثامنة أساسي/التاسعة أساسي

-- تحديث بيانات التلاميذ في جدول users
UPDATE users 
SET student_class = 'السابعة أساسي' 
WHERE student_class = 'السنة الأولى' AND role = 'student';

UPDATE users 
SET student_class = 'الثامنة أساسي' 
WHERE student_class = 'السنة الثانية' AND role = 'student';

UPDATE users 
SET student_class = 'التاسعة أساسي' 
WHERE student_class = 'السنة الثالثة' AND role = 'student';

-- حذف البيانات للسنة الرابعة (لا توجد في النظام الجديد)
-- أو يمكنك تعيينها للتاسعة أساسي
UPDATE users 
SET student_class = 'التاسعة أساسي' 
WHERE student_class = 'السنة الرابعة' AND role = 'student';

-- تحديث الدروس في جدول lessons
UPDATE lessons 
SET class = 'السابعة أساسي' 
WHERE class = 'السنة الأولى';

UPDATE lessons 
SET class = 'الثامنة أساسي' 
WHERE class = 'السنة الثانية';

UPDATE lessons 
SET class = 'التاسعة أساسي' 
WHERE class = 'السنة الثالثة';

UPDATE lessons 
SET class = 'التاسعة أساسي' 
WHERE class = 'السنة الرابعة';

-- تعديل ENUM في جدول lessons
-- ملاحظة: هذا يتطلب إعادة إنشاء العمود
ALTER TABLE lessons 
MODIFY COLUMN class ENUM('السابعة أساسي', 'الثامنة أساسي', 'التاسعة أساسي') NOT NULL;

-- عرض النتائج للتأكد
SELECT DISTINCT student_class FROM users WHERE role = 'student';
SELECT DISTINCT class FROM lessons;

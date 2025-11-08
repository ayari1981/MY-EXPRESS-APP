-- إضافة حقل class_number لجدول users
ALTER TABLE users ADD COLUMN class_number VARCHAR(10) AFTER student_class;

-- إضافة حقل class_number لجدول grades  
ALTER TABLE grades ADD COLUMN class_number VARCHAR(10) AFTER student_class;

-- إضافة فهارس لتحسين الأداء
CREATE INDEX idx_users_class_number ON users(class_number);
CREATE INDEX idx_grades_class_number ON grades(class_number);
CREATE INDEX idx_grades_class_combo ON grades(student_class, class_number);

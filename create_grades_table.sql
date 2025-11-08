-- إضافة حقول الأولياء لجدول المستخدمين
ALTER TABLE users 
ADD COLUMN child_first_name VARCHAR(100) AFTER parent_phone,
ADD COLUMN child_last_name VARCHAR(100) AFTER child_first_name;

-- إنشاء جدول النتائج
CREATE TABLE IF NOT EXISTS grades (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- معلومات التلميذ
  student_id INT NOT NULL,
  student_first_name VARCHAR(100) NOT NULL,
  student_last_name VARCHAR(100) NOT NULL,
  student_class VARCHAR(50) NOT NULL,
  
  -- معلومات المعلم
  teacher_id INT NOT NULL,
  teacher_first_name VARCHAR(100) NOT NULL,
  teacher_last_name VARCHAR(100) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  
  -- معلومات العلامة
  grade_type ENUM('فرض عادي', 'فرض تأليفي', 'شفاهي') NOT NULL,
  grade_value DECIMAL(5, 2) NOT NULL CHECK (grade_value >= 0 AND grade_value <= 20),
  max_grade DECIMAL(5, 2) DEFAULT 20,
  
  -- معلومات إضافية
  semester ENUM('الفصل الأول', 'الفصل الثاني', 'الفصل الثالث') NOT NULL,
  academic_year VARCHAR(20) NOT NULL DEFAULT '2024-2025',
  exam_date DATE,
  remarks TEXT,
  
  -- الحالة
  is_published BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  
  INDEX idx_student_id (student_id),
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_student_class (student_class),
  INDEX idx_subject (subject),
  INDEX idx_semester (semester),
  INDEX idx_academic_year (academic_year),
  INDEX idx_is_published (is_published),
  INDEX idx_student_name (student_first_name, student_last_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



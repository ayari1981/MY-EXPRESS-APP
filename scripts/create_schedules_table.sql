-- إنشاء جدول الجداول الدراسية
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

-- جدول سجلات الطلاب (الغيابات والعقوبات والملاحظات)
CREATE TABLE IF NOT EXISTS student_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  studentId INT NOT NULL,
  recordType ENUM('absence', 'punishment', 'note') NOT NULL,
  
  -- حقول الغياب
  absenceType ENUM('justified', 'unjustified') NULL,
  
  -- حقول العقوبة
  punishmentType ENUM('warning', 'detention', 'suspension', 'other') NULL,
  punishmentSeverity ENUM('minor', 'medium', 'severe') NULL,
  
  -- الوصف والتفاصيل
  description TEXT,
  notes TEXT,
  
  -- التاريخ
  date DATE NOT NULL,
  
  -- معلومات المسجل
  recordedBy INT NULL,
  
  -- حالة الإشعار
  parentNotified BOOLEAN DEFAULT FALSE,
  isRead BOOLEAN DEFAULT FALSE,
  notifiedAt DATETIME NULL,
  readAt DATETIME NULL,
  
  -- طوابع زمنية
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- المفاتيح الأجنبية
  FOREIGN KEY (studentId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recordedBy) REFERENCES users(id) ON DELETE SET NULL,
  
  -- الفهارس
  INDEX idx_student_id (studentId),
  INDEX idx_record_type (recordType),
  INDEX idx_date (date),
  INDEX idx_parent_notified (parentNotified),
  INDEX idx_is_read (isRead),
  INDEX idx_student_type (studentId, recordType),
  INDEX idx_student_date (studentId, date DESC),
  INDEX idx_unread_notifications (studentId, isRead, parentNotified)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

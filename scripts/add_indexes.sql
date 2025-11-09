-- تحسين أداء قاعدة البيانات بإضافة فهارس

-- فهارس لجدول grades
CREATE INDEX idx_grades_student_id ON grades(student_id);
CREATE INDEX idx_grades_subject ON grades(subject);
CREATE INDEX idx_grades_published ON grades(is_published);
CREATE INDEX idx_grades_student_subject ON grades(student_id, subject);
CREATE INDEX idx_grades_year_published ON grades(academic_year, is_published);

-- فهارس لجدول users
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_parent_id ON users(parent_id);

-- فهارس لجدول student_records
CREATE INDEX idx_student_records_student_id ON student_records(student_id);
CREATE INDEX idx_student_records_year ON student_records(academic_year);

-- فهارس لجدول schedules
CREATE INDEX idx_schedules_class ON schedules(class_name);
CREATE INDEX idx_schedules_day ON schedules(day_of_week);

-- فهارس لجدول notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- فهارس لجدول comments
CREATE INDEX idx_comments_student_id ON comments(student_id);
CREATE INDEX idx_comments_teacher_id ON comments(teacher_id);

-- فهارس لجدول feedbacks
CREATE INDEX idx_feedbacks_parent_id ON feedbacks(parent_id);
CREATE INDEX idx_feedbacks_created ON feedbacks(created_at);

-- فهارس لجدول lessons
CREATE INDEX idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX idx_lessons_subject ON lessons(subject);
CREATE INDEX idx_lessons_created ON lessons(created_at);

-- فهارس لجدول admin_logs
CREATE INDEX idx_admin_logs_admin_id ON admin_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_created ON admin_logs(created_at);

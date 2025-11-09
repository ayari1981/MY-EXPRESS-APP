const { sequelize } = require('./src/config/database');

async function addSampleGrades() {
  try {
    console.log('🔄 جاري إضافة علامات تجريبية...');

    // البحث عن طلاب موجودين باستخدام SQL مباشر
    const [students] = await sequelize.query(`
      SELECT id, name FROM users WHERE role = 'student' LIMIT 6
    `);

    if (students.length === 0) {
      console.log('❌ لا يوجد طلاب في قاعدة البيانات!');
      console.log('💡 يرجى إضافة طلاب أولاً من لوحة تحكم المدير');
      process.exit(1);
    }

    console.log(`✅ تم العثور على ${students.length} طالب`);

    // البحث عن معلم أو إضافته
    let [teachers] = await sequelize.query(`
      SELECT id FROM users WHERE email = 'teacher_test@test.com' LIMIT 1
    `);

    let teacherId;
    if (teachers.length === 0) {
      await sequelize.query(`
        INSERT INTO users (name, email, password, role, created_at, updated_at)
        VALUES ('الأستاذ محمد', 'teacher_test@test.com', '$2a$10$abcdefghijklmnopqrstuv', 'teacher', NOW(), NOW())
      `);
      [teachers] = await sequelize.query(`
        SELECT id FROM users WHERE email = 'teacher_test@test.com' LIMIT 1
      `);
    }
    teacherId = teachers[0].id;

    // حذف العلامات القديمة
    await sequelize.query(`
      DELETE FROM grades WHERE academic_year = '2024-2025' AND is_published = 1
    `);

    // العلامات التجريبية
    const subjects = ['الرياضيات', 'العربية', 'الفرنسية', 'الإنجليزية', 'العلوم'];
    let totalGrades = 0;

    for (const subject of subjects) {
      for (let index = 0; index < students.length; index++) {
        const student = students[index];
        const fullName = student.name.split(' ');
        const firstName = fullName[0] || 'طالب';
        const lastName = fullName.slice(1).join(' ') || 'الاختبار';
        
        // علامات مختلفة لكل طالب
        const baseGrade = 20 - (index * 1.5);
        
        const gradeTypes = ['فرض عادي', 'فرض تأليفي', 'شفاهي'];
        for (const gradeType of gradeTypes) {
          const gradeValue = parseFloat(Math.max(10, Math.min(20, baseGrade + (Math.random() * 2 - 1))).toFixed(2));
          
          await sequelize.query(`
            INSERT INTO grades (
              student_id, student_first_name, student_last_name, student_class,
              teacher_id, teacher_first_name, teacher_last_name,
              subject, grade_type, grade_value, max_grade,
              semester, academic_year, exam_date, is_published, created_at, updated_at
            ) VALUES (
              ${student.id}, '${firstName}', '${lastName}', 'السابعة أساسي',
              ${teacherId}, 'الأستاذ', 'محمد',
              '${subject}', '${gradeType}', ${gradeValue}, 20,
              'الفصل الأول', '2024-2025', NOW(), 1, NOW(), NOW()
            )
          `);
          totalGrades++;
        }
      }
    }

    console.log(`✅ تم إضافة ${totalGrades} علامة`);
    console.log('✅ تم إضافة البيانات التجريبية بنجاح!');
    console.log('');
    console.log('🌐 الآن افتح http://localhost:3000 لرؤية لوحة الشرف المذهلة! ✨');
    console.log('');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

addSampleGrades();

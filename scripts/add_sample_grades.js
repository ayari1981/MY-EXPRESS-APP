const { sequelize } = require('./src/config/database');
const { Grade, User } = require('./src/models');

async function addSampleGrades() {
  try {
    console.log('🔄 جاري إضافة علامات تجريبية...');

    // البحث عن طلاب موجودين أو إنشاء جدد
    const studentData = [
      { firstName: 'أحمد', lastName: 'بن علي', email: 'ahmed@test.com', parent: 'علي السالم' },
      { firstName: 'فاطمة', lastName: 'بنت محمد', email: 'fatima@test.com', parent: 'محمد العبدالله' },
      { firstName: 'محمد', lastName: 'بن خالد', email: 'mohamed@test.com', parent: 'خالد السعيد' },
      { firstName: 'سارة', lastName: 'بنت يوسف', email: 'sara@test.com', parent: 'يوسف الراشد' },
      { firstName: 'عمر', lastName: 'بن حسن', email: 'omar@test.com', parent: 'حسن الناصر' },
      { firstName: 'مريم', lastName: 'بنت أحمد', email: 'mariam@test.com', parent: 'أحمد المحمود' }
    ];

    const students = [];
    for (const data of studentData) {
      const [student] = await User.findOrCreate({
        where: { email: data.email },
        defaults: {
          name: `${data.firstName} ${data.lastName}`,
          password: 'password123',
          role: 'student',
          studentClass: 'السابعة أساسي',
          classNumber: String(Math.floor(Math.random() * 30) + 1)
        }
      });
      students.push({ ...student.toJSON(), parent: data.parent, firstName: data.firstName, lastName: data.lastName });
    }

    console.log(`✅ تم التحقق من ${students.length} طالب`);

    // إضافة أستاذ
    const [teacher] = await User.findOrCreate({
      where: { email: 'teacher@test.com' },
      defaults: {
        name: 'الأستاذ محمد',
        password: 'password123',
        role: 'teacher'
      }
    });

    const teacherId = teacher.id;

    // حذف العلامات القديمة
    await Grade.destroy({ where: { academicYear: '2024-2025' } });

    // العلامات التجريبية
    const subjects = ['الرياضيات', 'العربية', 'الفرنسية', 'الإنجليزية', 'العلوم'];
    const grades = [];

    subjects.forEach(subject => {
      students.forEach((student, index) => {
        // علامات مختلفة لكل طالب
        const baseGrade = 20 - (index * 1.5);
        
        for (let i = 0; i < 3; i++) {
          grades.push({
            studentId: student.id,
            studentFirstName: student.firstName,
            studentLastName: student.lastName,
            studentClass: 'السابعة أساسي',
            classNumber: student.classNumber,
            teacherId: teacherId,
            teacherFirstName: 'الأستاذ',
            teacherLastName: 'محمد',
            subject: subject,
            gradeType: i === 0 ? 'فرض عادي' : i === 1 ? 'فرض تأليفي' : 'شفاهي',
            gradeValue: Math.max(10, Math.min(20, baseGrade + (Math.random() * 2 - 1))),
            maxGrade: 20,
            semester: 'الفصل الأول',
            academicYear: '2024-2025',
            examDate: new Date(),
            isPublished: true
          });
        }
      });
    });

    await Grade.bulkCreate(grades);

    console.log(`✅ تم إضافة ${grades.length} علامة`);
    console.log('✅ تم إضافة البيانات التجريبية بنجاح!');
    console.log('🌐 افتح http://localhost:3000 لرؤية لوحة الشرف');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    process.exit();
  }
}

addSampleGrades();

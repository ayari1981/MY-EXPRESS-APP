const { sequelize } = require('./src/config/database');
const { Grade, User } = require('./src/models');

async function addSampleGrades() {
  try {
    console.log('🔄 جاري إضافة علامات تجريبية...');

    // البحث عن طلاب موجودين
    const allStudents = await User.findAll({
      where: { role: 'student' },
      limit: 6,
      attributes: ['id', 'name'],
      raw: true
    });

    if (allStudents.length === 0) {
      console.log('❌ لا يوجد طلاب في قاعدة البيانات!');
      console.log('💡 يرجى إضافة طلاب أولاً من لوحة تحكم المدير');
      process.exit(1);
    }

    console.log(`✅ تم العثور على ${allStudents.length} طالب`);

    // إضافة أستاذ
    let teacher = await User.findOne({ 
      where: { email: 'teacher1@test.com' },
      attributes: ['id'],
      raw: true
    });
    
    if (!teacher) {
      const newTeacher = await User.create({
        name: 'الأستاذ محمد',
        email: 'teacher1@test.com',
        password: 'password123',
        role: 'teacher'
      }, {
        fields: ['name', 'email', 'password', 'role']
      });
      teacher = { id: newTeacher.id };
    }

    const teacherId = teacher.id;

    // حذف العلامات القديمة
    await Grade.destroy({ where: { academicYear: '2024-2025', isPublished: true } });

    // العلامات التجريبية
    const subjects = ['الرياضيات', 'العربية', 'الفرنسية', 'الإنجليزية', 'العلوم'];
    const grades = [];

    subjects.forEach(subject => {
      allStudents.forEach((student, index) => {
        const fullName = student.name.split(' ');
        const firstName = fullName[0] || 'طالب';
        const lastName = fullName.slice(1).join(' ') || 'الاختبار';
        
        // علامات مختلفة لكل طالب
        const baseGrade = 20 - (index * 1.5);
        
        for (let i = 0; i < 3; i++) {
          grades.push({
            studentId: student.id,
            studentFirstName: firstName,
            studentLastName: lastName,
            studentClass: 'السابعة أساسي',
            classNumber: String(index + 1),
            teacherId: teacherId,
            teacherFirstName: 'الأستاذ',
            teacherLastName: 'محمد',
            subject: subject,
            gradeType: i === 0 ? 'فرض عادي' : i === 1 ? 'فرض تأليفي' : 'شفاهي',
            gradeValue: parseFloat(Math.max(10, Math.min(20, baseGrade + (Math.random() * 2 - 1))).toFixed(2)),
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
    console.log('');
    console.log('🌐 الآن افتح http://localhost:3000 لرؤية لوحة الشرف المذهلة! ✨');
    console.log('');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    process.exit();
  }
}

addSampleGrades();

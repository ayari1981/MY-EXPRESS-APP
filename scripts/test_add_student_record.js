// سكريبت لاختبار إضافة سجل طالب محلياً
require('dotenv').config();
const path = require('path');
const { connectDB } = require(path.join(__dirname, '..', 'src', 'config', 'database'));
const User = require(path.join(__dirname, '..', 'src', 'models', 'User'));
const StudentRecord = require(path.join(__dirname, '..', 'src', 'models', 'StudentRecord'));

async function testAddStudentRecord() {
  try {
    await connectDB();
    
    console.log('🧪 اختبار إضافة سجل طالب...\n');
    
    // 1. البحث عن طالب
    console.log('1️⃣ البحث عن طالب...');
    const student = await User.findOne({ 
      where: { role: 'student' }
    });
    
    if (!student) {
      console.error('❌ لا يوجد طلاب في قاعدة البيانات');
      // إنشاء طالب تجريبي
      const newStudent = await User.create({
        name: 'أحمد محمد',
        email: 'student@test.com',
        password: 'test123',
        role: 'student',
        studentClass: '7 أساسي',
        classNumber: '1'
      });
      console.log('✅ تم إنشاء طالب تجريبي:', newStudent.name);
      student = newStudent;
    } else {
      console.log(`✅ تم العثور على طالب: ${student.name} (${student.studentClass || 'لا يوجد صف'})`);
    }
    
    // 2. البحث عن معلم/مدير
    console.log('\n2️⃣ البحث عن معلم أو مدير...');
    const teacher = await User.findOne({ 
      where: { role: ['teacher', 'admin'] }
    });
    
    if (!teacher) {
      console.error('❌ لا يوجد معلم أو مدير');
      process.exit(1);
    }
    
    console.log(`✅ تم العثور على: ${teacher.name} (${teacher.role})`);
    
    // 3. تحضير البيانات
    console.log('\n3️⃣ تحضير بيانات السجل...');
    
    const studentName = student.name || '';
    const nameparts = studentName.trim().split(' ').filter(part => part.length > 0);
    const studentFirstName = nameparts[0] || 'غير محدد';
    const studentLastName = nameparts.slice(1).join(' ') || 'غير محدد';
    const studentClass = student.studentClass || 'غير محدد';
    
    const recordData = {
      studentId: student.id,
      recordType: 'absence', // غياب
      date: new Date().toISOString().split('T')[0], // اليوم
      absenceType: 'unjustified',
      description: 'غياب تجريبي للاختبار',
      recordedBy: teacher.id,
      // المعلومات المطلوبة مع قيم آمنة
      studentFirstName: studentFirstName,
      studentLastName: studentLastName,
      studentClass: studentClass,
      recordedByName: teacher.name || 'غير محدد',
      recordedByRole: teacher.role || 'teacher',
      parentNotified: false
    };
    
    console.log('📝 البيانات المحضرة:', recordData);
    
    // 4. محاولة إنشاء السجل
    console.log('\n4️⃣ محاولة إنشاء السجل...');
    
    const record = await StudentRecord.create(recordData);
    
    console.log('✅ تم إنشاء السجل بنجاح!');
    console.log(`   ID: ${record.id}`);
    console.log(`   للطالب: ${record.studentFirstName} ${record.studentLastName}`);
    console.log(`   النوع: ${record.recordType}`);
    console.log(`   التاريخ: ${record.date}`);
    console.log(`   المسجل بواسطة: ${record.recordedByName}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ خطأ أثناء الاختبار:');
    console.error(error.message);
    
    if (error.errors) {
      console.error('\n📋 تفاصيل الأخطاء:');
      error.errors.forEach(err => {
        console.error(`   - ${err.message} (${err.path}: ${err.value})`);
      });
    }
    
    process.exit(1);
  }
}

testAddStudentRecord();
// فحص جميع قيم القسم في قاعدة البيانات
require('dotenv').config();
const { sequelize, User, Lesson, Grade, StudentRecord } = require('../src/models');

async function checkAllClassValues() {
  try {
    console.log('🔍 فحص جميع قيم القسم في قاعدة البيانات...\n');

    // 1. فحص جدول users
    console.log('1️⃣ جدول المستخدمين (users):');
    const users = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'studentClass', 'classNumber'],
      raw: true
    });
    
    const uniqueClasses = [...new Set(users.map(u => u.studentClass))];
    console.log(`   عدد الطلاب: ${users.length}`);
    console.log(`   الأقسام الموجودة: ${uniqueClasses.join(', ')}`);
    
    const wrongFormat = users.filter(u => /^\d/.test(u.studentClass));
    if (wrongFormat.length > 0) {
      console.log(`   ⚠️ طلاب بقيم خاطئة (${wrongFormat.length}):`);
      wrongFormat.forEach(u => {
        console.log(`      - ${u.name} (ID: ${u.id}): "${u.studentClass}"`);
      });
    } else {
      console.log(`   ✅ جميع قيم student_class صحيحة\n`);
    }

    // 2. فحص جدول lessons
    console.log('2️⃣ جدول الدروس (lessons):');
    const lessons = await Lesson.findAll({
      attributes: ['id', 'title', 'studentClass', 'classNumber'],
      raw: true
    });
    
    const uniqueLessonClasses = [...new Set(lessons.map(l => l.studentClass))];
    console.log(`   عدد الدروس: ${lessons.length}`);
    console.log(`   الأقسام الموجودة: ${uniqueLessonClasses.join(', ')}`);
    
    const wrongLessons = lessons.filter(l => /^\d/.test(l.studentClass));
    if (wrongLessons.length > 0) {
      console.log(`   ⚠️ دروس بقيم خاطئة (${wrongLessons.length}):`);
      wrongLessons.forEach(l => {
        console.log(`      - ${l.title} (ID: ${l.id}): "${l.studentClass}"`);
      });
    } else {
      console.log(`   ✅ جميع قيم student_class صحيحة\n`);
    }

    // 3. فحص جدول grades
    console.log('3️⃣ جدول النتائج (grades):');
    const grades = await Grade.findAll({
      attributes: ['id', 'studentClass', 'subject'],
      raw: true
    });
    
    const uniqueGradeClasses = [...new Set(grades.map(g => g.studentClass))];
    console.log(`   عدد النتائج: ${grades.length}`);
    console.log(`   الأقسام الموجودة: ${uniqueGradeClasses.join(', ')}`);
    
    const wrongGrades = grades.filter(g => /^\d/.test(g.studentClass));
    if (wrongGrades.length > 0) {
      console.log(`   ⚠️ نتائج بقيم خاطئة (${wrongGrades.length}):`);
      wrongGrades.forEach(g => {
        console.log(`      - ${g.subject} (ID: ${g.id}): "${g.studentClass}"`);
      });
    } else {
      console.log(`   ✅ جميع قيم student_class صحيحة\n`);
    }

    // 4. فحص جدول student_records
    console.log('4️⃣ جدول سجلات الطلاب (student_records):');
    const records = await StudentRecord.findAll({
      attributes: ['id', 'studentClass', 'recordType'],
      raw: true
    });
    
    const uniqueRecordClasses = [...new Set(records.map(r => r.studentClass))];
    console.log(`   عدد السجلات: ${records.length}`);
    console.log(`   الأقسام الموجودة: ${uniqueRecordClasses.join(', ')}`);
    
    const wrongRecords = records.filter(r => /^\d/.test(r.studentClass));
    if (wrongRecords.length > 0) {
      console.log(`   ⚠️ سجلات بقيم خاطئة (${wrongRecords.length}):`);
      wrongRecords.forEach(r => {
        console.log(`      - ${r.recordType} (ID: ${r.id}): "${r.studentClass}"`);
      });
    } else {
      console.log(`   ✅ جميع قيم student_class صحيحة\n`);
    }

    // ملخص
    const totalWrong = wrongFormat.length + wrongLessons.length + wrongGrades.length + wrongRecords.length;
    if (totalWrong > 0) {
      console.log(`\n⚠️ المجموع: ${totalWrong} سجل بقيم خاطئة تحتاج للتحديث`);
    } else {
      console.log('\n✅ جميع البيانات في قاعدة البيانات صحيحة!');
    }

    await sequelize.close();
  } catch (err) {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  }
}

checkAllClassValues();

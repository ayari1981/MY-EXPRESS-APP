const { StudentRecord } = require('./src/models');
const { User } = require('./src/models');
const { Op } = require('sequelize');

async function migrateStudentRecordsTable() {
  try {
    console.log('بدء إنشاء جدول student_records...');

    // سيقوم Sequelize بإنشاء الجدول تلقائياً عند المزامنة
    await StudentRecord.sync({ force: false });

    console.log('✅ تم إنشاء جدول student_records بنجاح');
    
    // التحقق من الجدول
    const count = await StudentRecord.count();
    console.log(`📊 عدد السجلات في الجدول: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إنشاء الجدول:', error);
    process.exit(1);
  }
}

migrateStudentRecordsTable();

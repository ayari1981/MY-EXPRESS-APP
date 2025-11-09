require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function fixLessonsClassColumn() {
  console.log('🔧 إصلاح حقل class في جدول lessons...\n');

  try {
    // تغيير نوع الحقل من ENUM إلى VARCHAR(50)
    await sequelize.query(`
      ALTER TABLE lessons 
      MODIFY COLUMN class VARCHAR(50) NOT NULL;
    `);

    console.log('✅ تم تحديث حقل class بنجاح!');
    console.log('   الآن يمكن رفع دروس لأي قسم\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

fixLessonsClassColumn();

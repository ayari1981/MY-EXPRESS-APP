require('dotenv').config();
const { sequelize } = require('../src/config/database');

async function deleteOldLessonsSQL() {
  console.log('🗑️ حذف الدروس القديمة من قاعدة البيانات...\n');

  try {
    // حذف الدروس التي ملفاتها من نوفمبر 2024 أو قبل
    // (هذه الملفات بالتأكيد محذوفة من Railway)
    const [result] = await sequelize.query(`
      DELETE FROM lessons 
      WHERE file_url LIKE '%lessonFile-17627%'
         OR file_url LIKE '%lessonFile-17626%'
         OR created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)
    `);

    console.log(`✅ تم حذف ${result.affectedRows || 0} درس قديم`);
    console.log(`\n💡 الآن يمكن رفع دروس جديدة بدون أخطاء`);

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

deleteOldLessonsSQL();

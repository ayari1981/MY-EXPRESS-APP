// سكربت لتصدير البيانات من قاعدة البيانات القديمة
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// بيانات القاعدة القديمة
const OLD_DB = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'ecole_chebbi'
};

async function exportData() {
  console.log('📤 بدء تصدير البيانات من القاعدة القديمة...\n');
  
  let connection;
  const exportData = {};
  
  try {
    connection = await mysql.createConnection(OLD_DB);
    console.log('✅ متصل بالقاعدة القديمة\n');

    // الجداول المراد تصديرها بالترتيب (مع مراعاة العلاقات)
    const tables = [
      'users',
      'grades', 
      'student_records',
      'lessons',
      'comments',
      'notifications',
      'feedbacks',
      'admin_logs',
      'schedules'
    ];

    for (const table of tables) {
      try {
        const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
        exportData[table] = rows;
        console.log(`✓ ${table}: ${rows.length} سجل`);
      } catch (err) {
        console.log(`⚠️ ${table}: الجدول غير موجود أو فارغ`);
        exportData[table] = [];
      }
    }

    // حفظ البيانات في ملف JSON
    const backupDir = path.join(__dirname, '../backups');
    try {
      await fs.mkdir(backupDir, { recursive: true });
    } catch (e) { /* exists */ }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
    
    await fs.writeFile(backupFile, JSON.stringify(exportData, null, 2), 'utf8');
    
    console.log(`\n✅ تم حفظ النسخة الاحتياطية في:\n   ${backupFile}`);
    console.log(`\n📊 إجمالي السجلات المُصدَّرة:`);
    
    let totalRecords = 0;
    for (const [table, rows] of Object.entries(exportData)) {
      if (rows.length > 0) {
        console.log(`   ${table}: ${rows.length}`);
        totalRecords += rows.length;
      }
    }
    console.log(`   الإجمالي: ${totalRecords} سجل`);
    
    return backupFile;

  } catch (error) {
    console.error('❌ خطأ في التصدير:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  exportData()
    .then(() => {
      console.log('\n✅ اكتمل التصدير بنجاح');
      console.log('💡 الخطوة التالية: node scripts/import_database.js');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ فشل التصدير:', err.message);
      process.exit(1);
    });
}

module.exports = exportData;

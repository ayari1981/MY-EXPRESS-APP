// سكربت لاستيراد البيانات إلى قاعدة البيانات الجديدة
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// بيانات القاعدة الجديدة (من .env المحدّث)
const NEW_DB = {
  host: process.env.DB_HOST || 'metro.proxy.rlwy.net',
  port: Number(process.env.DB_PORT) || 51425,
  user: process.env.DB_USER || 'railway',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'railway'
};

async function importData(backupFile) {
  console.log('📥 بدء استيراد البيانات إلى القاعدة الجديدة...\n');
  
  let connection;
  
  try {
    // قراءة ملف النسخة الاحتياطية
    if (!backupFile) {
      const backupDir = path.join(__dirname, '../backups');
      const files = await fs.readdir(backupDir);
      const jsonFiles = files.filter(f => f.endsWith('.json')).sort().reverse();
      
      if (jsonFiles.length === 0) {
        throw new Error('لا توجد ملفات نسخ احتياطية. شغّل export_database.js أولاً');
      }
      
      backupFile = path.join(backupDir, jsonFiles[0]);
      console.log(`📂 استخدام آخر نسخة احتياطية: ${jsonFiles[0]}\n`);
    }

    const dataStr = await fs.readFile(backupFile, 'utf8');
    const data = JSON.parse(dataStr);
    
    // الاتصال بالقاعدة الجديدة
    connection = await mysql.createConnection(NEW_DB);
    console.log('✅ متصل بالقاعدة الجديدة\n');
    
    // تعطيل فحص المفاتيح الخارجية مؤقتاً
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // الجداول بالترتيب (الأساسية أولاً)
    const tablesOrder = [
      'users',
      'lessons',
      'grades',
      'student_records',
      'comments',
      'notifications',
      'feedbacks',
      'admin_logs',
      'schedules'
    ];

    let totalImported = 0;

    for (const table of tablesOrder) {
      if (!data[table] || data[table].length === 0) {
        console.log(`⊘ ${table}: لا توجد بيانات`);
        continue;
      }

      const rows = data[table];
      console.log(`⏳ ${table}: استيراد ${rows.length} سجل...`);

      try {
        // حذف البيانات القديمة إن وُجدت
        await connection.query(`DELETE FROM \`${table}\``);
        
        // إدراج البيانات
        for (const row of rows) {
          const columns = Object.keys(row).map(col => `\`${col}\``).join(', ');
          const placeholders = Object.keys(row).map(() => '?').join(', ');
          
          // تحويل التواريخ من ISO string إلى MySQL datetime
          const values = Object.entries(row).map(([key, value]) => {
            if (value && typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
              return new Date(value);
            }
            return value;
          });
          
          const sql = `INSERT INTO \`${table}\` (${columns}) VALUES (${placeholders})`;
          await connection.query(sql, values);
        }
        
        console.log(`✓ ${table}: تم استيراد ${rows.length} سجل`);
        totalImported += rows.length;
        
      } catch (err) {
        console.error(`✗ ${table}: خطأ - ${err.message}`);
      }
    }

    // إعادة تفعيل فحص المفاتيح الخارجية
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log(`\n✅ اكتمل الاستيراد: ${totalImported} سجل`);
    
    // عرض ملخص
    console.log('\n📊 التحقق من البيانات المستوردة:');
    for (const table of tablesOrder) {
      try {
        const [result] = await connection.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        if (result[0].count > 0) {
          console.log(`   ${table}: ${result[0].count} سجل`);
        }
      } catch (e) { /* ignore */ }
    }

  } catch (error) {
    console.error('❌ خطأ في الاستيراد:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  const backupFile = process.argv[2]; // يمكن تمرير مسار الملف كمعامل
  
  importData(backupFile)
    .then(() => {
      console.log('\n✅ اكتمل الاستيراد بنجاح');
      console.log('💡 الخطوة التالية: npm start (لاختبار التطبيق)');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ فشل الاستيراد:', err.message);
      process.exit(1);
    });
}

module.exports = importData;

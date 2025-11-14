// تصحيح جميع قيم القسم في قاعدة البيانات - باستخدام MySQL مباشرة
require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixAllClassValues() {
  let connection;
  try {
    console.log('🔧 تصحيح جميع قيم القسم في قاعدة البيانات...\n');

    // الاتصال بقاعدة البيانات
    const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || '';
    const u = new URL(connectionUrl);
    
    connection = await mysql.createConnection({
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: (u.pathname || '').replace(/^\//, '')
    });

    const mapping = {
      '7 أساسي': 'السابعة أساسي',
      '8 أساسي': 'الثامنة أساسي',
      '9 أساسي': 'التاسعة أساسي'
    };

    let totalFixed = 0;

    // 1. إصلاح جدول grades
    console.log('1️⃣ تصحيح جدول النتائج (grades):');
    for (const [oldValue, newValue] of Object.entries(mapping)) {
      const [result] = await connection.query(
        'UPDATE grades SET student_class = ? WHERE student_class = ?',
        [newValue, oldValue]
      );
      if (result.affectedRows > 0) {
        console.log(`   ✓ تم تحديث ${result.affectedRows} سجل: "${oldValue}" → "${newValue}"`);
        totalFixed += result.affectedRows;
      }
    }

    // 2. إصلاح جدول student_records
    console.log('\n2️⃣ تصحيح جدول سجلات الطلاب (student_records):');
    for (const [oldValue, newValue] of Object.entries(mapping)) {
      const [result] = await connection.query(
        'UPDATE student_records SET student_class = ? WHERE student_class = ?',
        [newValue, oldValue]
      );
      if (result.affectedRows > 0) {
        console.log(`   ✓ تم تحديث ${result.affectedRows} سجل: "${oldValue}" → "${newValue}"`);
        totalFixed += result.affectedRows;
      }
    }

    console.log(`\n✅ تم تصحيح ${totalFixed} سجل بنجاح!`);
    
    // التحقق
    console.log('\n🔍 التحقق من النتائج:');
    const [gradesCheck] = await connection.query(
      'SELECT DISTINCT student_class FROM grades ORDER BY student_class'
    );
    console.log('   جدول grades:', gradesCheck.map(g => g.student_class).join(', '));
    
    const [recordsCheck] = await connection.query(
      'SELECT DISTINCT student_class FROM student_records ORDER BY student_class'
    );
    console.log('   جدول student_records:', recordsCheck.map(r => r.student_class).join(', '));

    console.log('\n✅ اكتمل التصحيح!');
  } catch (err) {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

fixAllClassValues();

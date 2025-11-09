require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixStudentClassNumbers() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ متصل بقاعدة البيانات\n');

    // استخراج رقم الصف من اسم الصف وتحديث جدول users
    const classMapping = {
      '7 أساسي أ': '7',
      '7 أساسي ب': '7',
      '8 أساسي أ': '8',
      '8 أساسي ب': '8',
      '9 أساسي أ': '9',
      '9 أساسي ب': '9'
    };

    let updated = 0;
    for (const [className, classNumber] of Object.entries(classMapping)) {
      const [result] = await connection.query(`
        UPDATE users 
        SET class_number = ? 
        WHERE role = 'student' 
        AND student_class = ? 
        AND (class_number IS NULL OR class_number = '')
      `, [classNumber, className]);

      if (result.affectedRows > 0) {
        console.log(`✅ تحديث ${result.affectedRows} تلميذ في ${className} -> رقم الصف ${classNumber}`);
        updated += result.affectedRows;
      }
    }

    console.log(`\n✅ تم تحديث ${updated} تلميذ بنجاح!`);

    // عرض البيانات بعد التحديث
    console.log('\n📋 التلاميذ بعد التحديث:');
    const [students] = await connection.query(`
      SELECT id, name, student_class, class_number 
      FROM users 
      WHERE role = 'student' 
      ORDER BY id DESC 
      LIMIT 20
    `);
    console.table(students);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

fixStudentClassNumbers();

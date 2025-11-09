require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixClassNames() {
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

    // تحديث جدول users
    console.log('📝 تحديث جدول users...');
    const [result1] = await connection.query(`
      UPDATE users 
      SET student_class = CASE 
        WHEN student_class LIKE '7%' THEN '7 أساسي'
        WHEN student_class LIKE '8%' THEN '8 أساسي'
        WHEN student_class LIKE '9%' THEN '9 أساسي'
        ELSE student_class
      END
      WHERE role = 'student'
      AND student_class REGEXP '[أب]$'
    `);
    console.log(`✅ تم تحديث ${result1.affectedRows} تلميذ في جدول users`);

    // تحديث جدول student_records
    console.log('\n📝 تحديث جدول student_records...');
    const [result2] = await connection.query(`
      UPDATE student_records 
      SET student_class = CASE 
        WHEN student_class LIKE '7%' THEN '7 أساسي'
        WHEN student_class LIKE '8%' THEN '8 أساسي'
        WHEN student_class LIKE '9%' THEN '9 أساسي'
        ELSE student_class
      END
      WHERE student_class REGEXP '[أب]$'
    `);
    console.log(`✅ تم تحديث ${result2.affectedRows} سجل في جدول student_records`);

    // عرض البيانات بعد التحديث
    console.log('\n📋 التلاميذ بعد التحديث:');
    const [students] = await connection.query(`
      SELECT id, name, student_class, class_number 
      FROM users 
      WHERE role = 'student' 
      ORDER BY class_number, id
    `);
    console.table(students);

    // عرض الأقسام الفريدة
    console.log('\n📚 الأقسام الموجودة:');
    const [classes] = await connection.query(`
      SELECT DISTINCT student_class, class_number, COUNT(*) as عدد_التلاميذ
      FROM users 
      WHERE role = 'student'
      GROUP BY student_class, class_number
      ORDER BY class_number
    `);
    console.table(classes);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

fixClassNames();

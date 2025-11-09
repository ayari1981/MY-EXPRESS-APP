require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkStudentsData() {
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

    // فحص جدول users
    console.log('📋 التلاميذ في جدول users:');
    const [students] = await connection.query(`
      SELECT id, name, student_class, class_number, role, created_at 
      FROM users 
      WHERE role = 'student' 
      ORDER BY id DESC 
      LIMIT 20
    `);
    console.table(students);

    // فحص جدول student_records
    console.log('\n📋 السجلات في جدول student_records:');
    const [records] = await connection.query(`
      SELECT student_id, student_first_name, student_last_name, 
             student_class, class_number, created_at 
      FROM student_records 
      ORDER BY student_id DESC 
      LIMIT 20
    `);
    console.table(records);

    // فحص التلاميذ الذين ليس لهم قسم
    console.log('\n⚠️ التلاميذ بدون قسم في جدول users:');
    const [noClass] = await connection.query(`
      SELECT id, name, student_class, class_number 
      FROM users 
      WHERE role = 'student' AND (student_class IS NULL OR student_class = '')
    `);
    console.table(noClass);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkStudentsData();

require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkStudents() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ متصل بقاعدة البيانات\n');
    
    // عرض التلاميذ الموجودين
    const [students] = await connection.query(`
      SELECT id, name, email, student_class, class_number, role 
      FROM users 
      WHERE role = 'student' 
      ORDER BY student_class, name
      LIMIT 20
    `);
    
    console.log('📋 التلاميذ المسجلين:\n');
    console.table(students);
    
    // إحصائيات
    const [stats] = await connection.query(`
      SELECT student_class, COUNT(*) as count 
      FROM users 
      WHERE role = 'student' 
      GROUP BY student_class
    `);
    
    console.log('\n📊 الإحصائيات حسب القسم:\n');
    console.table(stats);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkStudents();

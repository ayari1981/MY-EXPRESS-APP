require('dotenv').config();
const mysql = require('mysql2/promise');

async function deleteStudent() {
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
    
    // حذف التلميذ ALI
    const [result] = await connection.query(
      "DELETE FROM users WHERE email = 'ali@gmail.com' AND role = 'student'"
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ تم حذف التلميذ ALI بنجاح\n');
    } else {
      console.log('⚠️  التلميذ ALI غير موجود\n');
    }
    
    // عرض التلاميذ المتبقين
    const [students] = await connection.query(`
      SELECT id, name, email, student_class, class_number 
      FROM users 
      WHERE role = 'student' 
      ORDER BY id
    `);
    
    console.log('📋 التلاميذ المتبقين:\n');
    console.table(students);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

deleteStudent();

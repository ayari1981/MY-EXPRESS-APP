require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkStudentData() {
  let connection;
  
  try {
    const mysqlUrl = process.env.MYSQL_URL;
    if (mysqlUrl) {
      connection = await mysql.createConnection(mysqlUrl);
    } else {
      connection = await mysql.createConnection({
        host: process.env.MYSQLHOST || 'localhost',
        port: process.env.MYSQLPORT || 3306,
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE || 'railway',
        ssl: process.env.MYSQLHOST ? { rejectUnauthorized: false } : undefined
      });
    }
    
    console.log('✅ متصل بقاعدة البيانات\n');
    
    // عرض جميع التلاميذ مع القسم والفصل
    const [students] = await connection.query(`
      SELECT id, name, email, student_class, section, role
      FROM users 
      WHERE role = 'student'
      ORDER BY student_class, section, name
    `);
    
    console.log('📋 جميع التلاميذ:\n');
    console.table(students.map(s => ({
      الاسم: s.name,
      البريد: s.email,
      القسم: s.student_class || 'غير محدد',
      الفصل: s.section || 'غير محدد'
    })));
    
    // عد التلاميذ بدون قسم
    const [withoutClass] = await connection.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'student' AND (student_class IS NULL OR student_class = '')
    `);
    
    console.log(`\n⚠️ تلاميذ بدون قسم: ${withoutClass[0].count}`);
    
    // عد التلاميذ بدون فصل
    const [withoutSection] = await connection.query(`
      SELECT COUNT(*) as count
      FROM users
      WHERE role = 'student' AND (section IS NULL OR section = '')
    `);
    
    console.log(`⚠️ تلاميذ بدون فصل: ${withoutSection[0].count}\n`);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    if (connection) await connection.end();
  }
}

checkStudentData();

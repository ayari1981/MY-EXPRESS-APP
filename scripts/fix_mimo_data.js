require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixMimoData() {
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
    console.log('🔄 تحديث بيانات mimo ben taher...\n');
    
    // تحديث القسم والفصل لـ mimo
    await connection.query(`
      UPDATE users 
      SET student_class = 'السابعة أساسي', section = '1'
      WHERE email = 'mimo@gmail.com'
    `);
    
    console.log('✅ تم تحديث بيانات mimo بنجاح!');
    console.log('   القسم: السابعة أساسي');
    console.log('   الفصل: 1\n');
    
    // عرض جميع التلاميذ الآن
    const [students] = await connection.query(`
      SELECT name, student_class, section
      FROM users 
      WHERE role = 'student' AND email = 'mimo@gmail.com'
    `);
    
    console.log('📋 البيانات المحدثة:\n');
    console.table(students.map(s => ({
      الاسم: s.name,
      القسم: s.student_class,
      الفصل: s.section
    })));
    
    await connection.end();
    console.log('\n✅ تم الانتهاء بنجاح!\n');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    if (connection) await connection.end();
  }
}

fixMimoData();

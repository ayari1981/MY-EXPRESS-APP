require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateAllSections() {
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
    console.log('🔄 تحديث جميع التلاميذ بفصول...\n');
    
    // الحصول على جميع التلاميذ
    const [students] = await connection.query(`
      SELECT id, name, student_class 
      FROM users 
      WHERE role = 'student'
      ORDER BY student_class, id
    `);
    
    console.log(`📊 عدد التلاميذ: ${students.length}\n`);
    
    // تقسيم التلاميذ على الفصول
    let sectionCounter = {};
    
    for (const student of students) {
      const className = student.student_class;
      
      if (!sectionCounter[className]) {
        sectionCounter[className] = { current: 1, count: 0 };
      }
      
      sectionCounter[className].count++;
      
      // كل 10 تلاميذ نبدل للفصل التالي
      if (sectionCounter[className].count > 10) {
        sectionCounter[className].current++;
        sectionCounter[className].count = 1;
      }
      
      const section = sectionCounter[className].current.toString();
      
      await connection.query(`
        UPDATE users 
        SET section = ? 
        WHERE id = ?
      `, [section, student.id]);
      
      console.log(`✓ ${student.name} → ${className} - فصل ${section}`);
    }
    
    console.log('\n✅ تم تحديث جميع التلاميذ بنجاح!\n');
    
    // عرض النتائج النهائية
    const [result] = await connection.query(`
      SELECT student_class, section, COUNT(*) as count
      FROM users
      WHERE role = 'student'
      GROUP BY student_class, section
      ORDER BY student_class, section
    `);
    
    console.log('📊 توزيع التلاميذ النهائي:\n');
    console.table(result);
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    if (connection) await connection.end();
  }
}

updateAllSections();

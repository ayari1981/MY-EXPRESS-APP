require('dotenv').config();
const mysql = require('mysql2/promise');

async function distributeToMultipleSections() {
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
    console.log('🔄 توزيع التلاميذ على فصول متعددة...\n');
    
    // توزيع السابعة أساسي على 3 فصول
    const [grade7] = await connection.query(`
      SELECT id, name FROM users 
      WHERE role = 'student' AND student_class = 'السابعة أساسي'
      ORDER BY id
    `);
    
    for (let i = 0; i < grade7.length; i++) {
      const section = (i % 3) + 1; // 1, 2, 3
      await connection.query(`UPDATE users SET section = ? WHERE id = ?`, [section.toString(), grade7[i].id]);
      console.log(`✓ ${grade7[i].name} → السابعة أساسي - فصل ${section}`);
    }
    
    // توزيع الثامنة أساسي على فصلين
    const [grade8] = await connection.query(`
      SELECT id, name FROM users 
      WHERE role = 'student' AND student_class = 'الثامنة أساسي'
      ORDER BY id
    `);
    
    for (let i = 0; i < grade8.length; i++) {
      const section = (i % 2) + 1; // 1, 2
      await connection.query(`UPDATE users SET section = ? WHERE id = ?`, [section.toString(), grade8[i].id]);
      console.log(`✓ ${grade8[i].name} → الثامنة أساسي - فصل ${section}`);
    }
    
    // توزيع التاسعة أساسي على فصلين
    const [grade9] = await connection.query(`
      SELECT id, name FROM users 
      WHERE role = 'student' AND student_class = 'التاسعة أساسي'
      ORDER BY id
    `);
    
    for (let i = 0; i < grade9.length; i++) {
      const section = (i % 2) + 1; // 1, 2
      await connection.query(`UPDATE users SET section = ? WHERE id = ?`, [section.toString(), grade9[i].id]);
      console.log(`✓ ${grade9[i].name} → التاسعة أساسي - فصل ${section}`);
    }
    
    console.log('\n✅ تم توزيع جميع التلاميذ بنجاح!\n');
    
    // عرض النتائج النهائية
    const [result] = await connection.query(`
      SELECT student_class, section, COUNT(*) as count, GROUP_CONCAT(name SEPARATOR ', ') as students
      FROM users
      WHERE role = 'student'
      GROUP BY student_class, section
      ORDER BY student_class, section
    `);
    
    console.log('📊 توزيع التلاميذ النهائي:\n');
    result.forEach(row => {
      console.log(`\n${row.student_class} - فصل ${row.section}: ${row.count} تلميذ`);
      console.log(`  التلاميذ: ${row.students.substring(0, 100)}${row.students.length > 100 ? '...' : ''}`);
    });
    
    console.table(result.map(r => ({
      القسم: r.student_class,
      الفصل: r.section,
      العدد: r.count
    })));
    
    await connection.end();
    console.log('\n✅ الآن يمكنك اختبار نظام الإشعارات! 🎉\n');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    if (connection) await connection.end();
  }
}

distributeToMultipleSections();

require('dotenv').config();
const mysql = require('mysql2/promise');

async function addSectionColumn() {
  let connection;
  
  try {
    // الاتصال بقاعدة البيانات
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
    console.log('🔧 إضافة عمود section إلى جدول users...\n');
    
    // إضافة عمود section
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN section VARCHAR(50) NULL AFTER student_class
    `);
    
    console.log('✅ تم إضافة عمود section بنجاح!\n');
    
    // التحقق من البنية
    const [columns] = await connection.query(`
      DESCRIBE users
    `);
    
    console.log('📋 بنية جدول users:\n');
    console.table(columns);
    
    console.log('\n🔄 تحديث بيانات التلاميذ...\n');
    
    // تعيين فصول افتراضية للتلاميذ الموجودين
    // السابعة أساسي
    await connection.query(`
      UPDATE users 
      SET section = '1' 
      WHERE role = 'student' 
      AND student_class = 'السابعة أساسي' 
      AND (section IS NULL OR section = '')
      LIMIT 10
    `);
    
    await connection.query(`
      UPDATE users 
      SET section = '2' 
      WHERE role = 'student' 
      AND student_class = 'السابعة أساسي' 
      AND (section IS NULL OR section = '')
      LIMIT 10
    `);
    
    // الثامنة أساسي
    await connection.query(`
      UPDATE users 
      SET section = '1' 
      WHERE role = 'student' 
      AND student_class = 'الثامنة أساسي' 
      AND (section IS NULL OR section = '')
      LIMIT 10
    `);
    
    await connection.query(`
      UPDATE users 
      SET section = '2' 
      WHERE role = 'student' 
      AND student_class = 'الثامنة أساسي' 
      AND (section IS NULL OR section = '')
      LIMIT 10
    `);
    
    // التاسعة أساسي
    await connection.query(`
      UPDATE users 
      SET section = '1' 
      WHERE role = 'student' 
      AND student_class = 'التاسعة أساسي' 
      AND (section IS NULL OR section = '')
      LIMIT 10
    `);
    
    await connection.query(`
      UPDATE users 
      SET section = '2' 
      WHERE role = 'student' 
      AND student_class = 'التاسعة أساسي' 
      AND (section IS NULL OR section = '')
      LIMIT 10
    `);
    
    console.log('✅ تم تحديث بيانات التلاميذ بنجاح!\n');
    
    // عرض النتائج
    const [students] = await connection.query(`
      SELECT student_class, section, COUNT(*) as count
      FROM users
      WHERE role = 'student' AND section IS NOT NULL
      GROUP BY student_class, section
      ORDER BY student_class, section
    `);
    
    console.log('📊 توزيع التلاميذ على الفصول:\n');
    console.table(students);
    
    console.log('\n✅ تم الانتهاء بنجاح!');
    console.log('يمكنك الآن استخدام نظام الإشعارات بالفصول 🎉\n');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

addSectionColumn();

require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixClassStructure() {
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
    console.log('🔧 إصلاح هيكل القسم والصف والثلاثي...\n');
    
    // إعادة تسمية العمود section إلى class_section (الصف)
    console.log('1️⃣ إعادة تسمية عمود section إلى class_section...');
    try {
      await connection.query(`
        ALTER TABLE users 
        CHANGE COLUMN section class_section VARCHAR(50) NULL
      `);
      console.log('   ✅ تم تغيير اسم العمود بنجاح\n');
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        console.log('   ℹ️ العمود class_section موجود مسبقاً\n');
      } else {
        throw error;
      }
    }
    
    // عرض البنية الحالية
    console.log('2️⃣ البنية الحالية للجدول:\n');
    const [columns] = await connection.query(`
      DESCRIBE users
    `);
    
    const relevantColumns = columns.filter(c => 
      ['student_class', 'class_section', 'section', 'student_section', 'class_number'].includes(c.Field)
    );
    console.table(relevantColumns);
    
    // عرض البيانات الحالية
    console.log('\n3️⃣ البيانات الحالية للتلاميذ:\n');
    const [students] = await connection.query(`
      SELECT name, student_class, class_section
      FROM users 
      WHERE role = 'student'
      ORDER BY student_class, class_section
      LIMIT 10
    `);
    
    console.table(students.map(s => ({
      الاسم: s.name,
      القسم: s.student_class || 'غير محدد',
      'الصف (class_section)': s.class_section || 'غير محدد'
    })));
    
    await connection.end();
    console.log('\n✅ تم الانتهاء بنجاح!\n');
    console.log('📝 ملاحظة: الآن لدينا:');
    console.log('   - student_class: القسم (السابعة أساسي)');
    console.log('   - class_section: الصف (1، 2، 3، ...)');
    console.log('   - trimester: الثلاثي (سنضيفه للنتائج والجداول)\n');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    if (connection) await connection.end();
  }
}

fixClassStructure();

require('dotenv').config();
const mysql = require('mysql2/promise');

async function updateOldGradesClasses() {
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

    // تحديث جدول grades
    console.log('📝 تحديث جدول grades...');
    
    // السابعة أساسي -> 7 أساسي
    const [result1] = await connection.query(`
      UPDATE grades 
      SET student_class = '7 أساسي'
      WHERE student_class LIKE '%سابعة%' OR student_class LIKE 'السابعة%'
    `);
    console.log(`✅ تحديث ${result1.affectedRows} سجل من السابعة أساسي -> 7 أساسي`);

    // الثامنة أساسي -> 8 أساسي
    const [result2] = await connection.query(`
      UPDATE grades 
      SET student_class = '8 أساسي'
      WHERE student_class LIKE '%ثامنة%' OR student_class LIKE 'الثامنة%'
    `);
    console.log(`✅ تحديث ${result2.affectedRows} سجل من الثامنة أساسي -> 8 أساسي`);

    // التاسعة أساسي -> 9 أساسي
    const [result3] = await connection.query(`
      UPDATE grades 
      SET student_class = '9 أساسي'
      WHERE student_class LIKE '%تاسعة%' OR student_class LIKE 'التاسعة%'
    `);
    console.log(`✅ تحديث ${result3.affectedRows} سجل من التاسعة أساسي -> 9 أساسي`);

    // عرض البيانات بعد التحديث
    console.log('\n📋 الأقسام في جدول grades بعد التحديث:');
    const [classes] = await connection.query(`
      SELECT DISTINCT student_class, class_number, COUNT(*) as عدد_النتائج
      FROM grades 
      GROUP BY student_class, class_number
      ORDER BY student_class, class_number
    `);
    console.table(classes);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

updateOldGradesClasses();

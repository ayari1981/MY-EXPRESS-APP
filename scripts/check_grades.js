require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkGrades() {
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
    
    // عرض جميع النتائج
    const [grades] = await connection.query(`
      SELECT id, student_first_name, student_last_name, subject, grade_value, 
             semester, is_published, created_at
      FROM grades 
      ORDER BY created_at DESC
      LIMIT 20
    `);
    
    console.log('📋 النتائج في قاعدة البيانات:\n');
    console.table(grades);
    
    // إحصائيات
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_published = 1 THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN is_published = 0 THEN 1 ELSE 0 END) as unpublished
      FROM grades
    `);
    
    console.log('\n📊 الإحصائيات:\n');
    console.table(stats);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkGrades();

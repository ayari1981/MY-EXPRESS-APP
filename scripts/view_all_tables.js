require('dotenv').config();
const mysql = require('mysql2/promise');

async function viewAllTables() {
  const config = {
    host: process.env.DB_HOST || 'metro.proxy.rlwy.net',
    port: Number(process.env.DB_PORT) || 51425,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'SWRwvEsAmiQYoxmesxpxOulHjwfeYUzt',
    database: process.env.DB_NAME || 'railway'
  };

  console.log('🔍 عرض محتوى جميع الجداول\n');
  console.log(`📊 قاعدة البيانات: ${config.database}@${config.host}:${config.port}\n`);

  try {
    const connection = await mysql.createConnection(config);
    
    // الحصول على قائمة الجداول
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log(`✅ وجدت ${tables.length} جداول:\n`);

    for (const table of tables) {
      const tableName = Object.values(table)[0];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📋 جدول: ${tableName}`);
      console.log('='.repeat(60));

      // عدد السجلات
      const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = countResult[0].count;
      
      if (count === 0) {
        console.log('⚠️  فارغ - لا توجد سجلات\n');
        continue;
      }

      console.log(`📊 عدد السجلات: ${count}\n`);

      // عرض أول 5 سجلات
      const [rows] = await connection.query(`SELECT * FROM ${tableName} LIMIT 5`);
      
      if (rows.length > 0) {
        console.log('📄 أول 5 سجلات:');
        console.log(JSON.stringify(rows, null, 2));
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ انتهى العرض');
    console.log('='.repeat(60));

    await connection.end();
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

viewAllTables();

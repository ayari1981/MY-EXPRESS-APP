// سكربت لعرض معلومات مفصلة عن الجداول وبنيتها
require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'metro.proxy.rlwy.net',
  port: Number(process.env.DB_PORT) || 51425,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'railway'
};

async function showDatabaseInfo() {
  console.log('📊 معلومات قاعدة البيانات التفصيلية\n');
  console.log('🔗 الاتصال:', `${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}\n`);
  
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ متصل بنجاح\n');
    
    // عرض القاعدة الحالية
    const [currentDb] = await connection.query('SELECT DATABASE() as db');
    console.log(`📂 القاعدة الحالية: ${currentDb[0].db}\n`);
    
    // عرض جميع الجداول
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📋 الجداول (${tables.length}):\n`);
    
    if (tables.length === 0) {
      console.log('   ⚠️ لا توجد جداول في هذه القاعدة!\n');
      
      // التحقق من القواعد الأخرى
      const [databases] = await connection.query('SHOW DATABASES');
      console.log('💡 القواعد المتاحة:');
      databases.forEach(db => {
        const dbName = Object.values(db)[0];
        console.log(`   - ${dbName}`);
      });
      
    } else {
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        
        // عد السجلات
        const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
        const count = countResult[0].count;
        
        // حجم الجدول
        const [sizeResult] = await connection.query(
          `SELECT 
            ROUND(((data_length + index_length) / 1024), 2) AS size_kb
          FROM information_schema.TABLES 
          WHERE table_schema = ? AND table_name = ?`,
          [dbConfig.database, tableName]
        );
        const sizeKB = sizeResult[0]?.size_kb || 0;
        
        console.log(`   ✓ ${tableName.padEnd(20)} | ${String(count).padStart(4)} سجل | ${sizeKB} KB`);
      }
      
      // إجمالي حجم القاعدة
      const [totalSize] = await connection.query(
        `SELECT 
          ROUND(SUM(data_length + index_length) / 1024, 2) AS total_kb
        FROM information_schema.TABLES 
        WHERE table_schema = ?`,
        [dbConfig.database]
      );
      
      console.log(`\n📊 إجمالي الحجم: ${totalSize[0].total_kb} KB`);
    }
    
    console.log('\n✅ انتهى العرض');
    
  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 القاعدة المحددة غير موجودة. تحقق من DB_NAME في .env');
    }
  } finally {
    if (connection) await connection.end();
  }
}

showDatabaseInfo();

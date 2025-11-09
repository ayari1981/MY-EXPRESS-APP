require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applyIndexes() {
  let connection;
  
  try {
    console.log('📊 بدء تطبيق الفهارس على Railway...');
    
    // الاتصال بقاعدة البيانات على Railway
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ تم الاتصال بقاعدة البيانات على Railway');
    
    // قراءة ملف SQL
    const sqlFile = path.join(__dirname, 'add_indexes.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // تقسيم الأوامر
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 عدد الفهارس: ${commands.length}`);
    
    // تنفيذ كل أمر
    let successCount = 0;
    for (const command of commands) {
      try {
        await connection.query(command);
        successCount++;
        console.log(`✅ تم تطبيق فهرس ${successCount}/${commands.length}`);
      } catch (error) {
        if (error.message.includes('Duplicate key name') || error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠️  الفهرس موجود بالفعل - تجاوز`);
          successCount++;
        } else {
          console.error(`❌ خطأ في تطبيق الفهرس:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ تم تطبيق ${successCount}/${commands.length} فهرس بنجاح!`);
    console.log('🎉 انتهى تطبيق الفهارس');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

applyIndexes();

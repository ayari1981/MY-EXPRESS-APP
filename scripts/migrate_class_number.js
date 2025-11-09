require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    
    // الاتصال بقاعدة البيانات
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    console.log('✅ تم الاتصال بنجاح');
    
    // قراءة ملف SQL
    const sqlFile = path.join(__dirname, 'add_class_number.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // تقسيم الاستعلامات - إزالة التعليقات أولاً
    const lines = sql.split('\n');
    let currentQuery = '';
    const queries = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      // تجاهل التعليقات والأسطر الفارغة
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      currentQuery += ' ' + trimmedLine;
      
      // إذا انتهى السطر بـ ; فهذا استعلام كامل
      if (trimmedLine.endsWith(';')) {
        queries.push(currentQuery.trim().replace(/;$/, ''));
        currentQuery = '';
      }
    }
    
    console.log(`\n📝 سيتم تنفيذ ${queries.length} استعلام...\n`);
    
    // تنفيذ كل استعلام
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      console.log(`${i + 1}. ${query.substring(0, 80)}...`);
      
      try {
        await connection.query(query);
        console.log('   ✅ تم بنجاح');
      } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('   ⚠️  الحقل موجود مسبقاً');
        } else if (err.code === 'ER_DUP_KEYNAME') {
          console.log('   ⚠️  الفهرس موجود مسبقاً');
        } else {
          throw err;
        }
      }
    }
    
    console.log('\n✅ تمت العملية بنجاح!');
    
    // التحقق من الحقول الجديدة
    console.log('\n🔍 التحقق من الحقول الجديدة...');
    
    const [usersColumns] = await connection.query('SHOW COLUMNS FROM users LIKE "class_number"');
    const [gradesColumns] = await connection.query('SHOW COLUMNS FROM grades LIKE "class_number"');
    
    if (usersColumns.length > 0) {
      console.log('✅ حقل class_number موجود في جدول users');
    } else {
      console.log('❌ حقل class_number غير موجود في جدول users');
    }
    
    if (gradesColumns.length > 0) {
      console.log('✅ حقل class_number موجود في جدول grades');
    } else {
      console.log('❌ حقل class_number غير موجود في جدول grades');
    }
    
  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 تم إغلاق الاتصال بقاعدة البيانات');
    }
  }
}

runMigration();

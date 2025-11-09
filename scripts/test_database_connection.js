// سكربت للتحقق من اتصال قاعدة البيانات
require('dotenv').config();
const mysql = require('mysql2/promise');

// قراءة المتغيرات بنفس طريقة database.js
const hasDBSet = Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME);
const hasMYSQLSet = Boolean(process.env.MYSQLHOST && process.env.MYSQLUSER && process.env.MYSQLPASSWORD && process.env.MYSQLDATABASE);
const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || '';

let dbName, dbUser, dbPassword, dbHost, dbPort;

const tryParseUrl = (url) => {
  try {
    const u = new URL(url);
    if (u.protocol && u.protocol.startsWith('mysql')) {
      return {
        name: (u.pathname || '').replace(/^\//, '') || undefined,
        user: decodeURIComponent(u.username || ''),
        password: decodeURIComponent(u.password || ''),
        host: u.hostname,
        port: Number(u.port || 3306)
      };
    }
  } catch (e) { /* ignore */ }
  return null;
};

const parsed = connectionUrl ? tryParseUrl(connectionUrl) : null;

if (parsed && parsed.host && parsed.user && parsed.name) {
  dbName = parsed.name;
  dbUser = parsed.user;
  dbPassword = parsed.password || '';
  dbHost = parsed.host;
  dbPort = parsed.port || 3306;
} else if (hasDBSet) {
  dbName = process.env.DB_NAME;
  dbUser = process.env.DB_USER;
  dbPassword = process.env.DB_PASSWORD;
  dbHost = process.env.DB_HOST;
  dbPort = Number(process.env.DB_PORT || 3306);
} else if (hasMYSQLSet) {
  dbName = process.env.MYSQLDATABASE;
  dbUser = process.env.MYSQLUSER;
  dbPassword = process.env.MYSQLPASSWORD;
  dbHost = process.env.MYSQLHOST;
  dbPort = Number(process.env.MYSQLPORT || 3306);
} else {
  dbName = 'ecole_chebbi';
  dbUser = 'root';
  dbPassword = 'loi123';
  dbHost = 'localhost';
  dbPort = 3306;
}

async function testConnection() {
  console.log('🔍 التحقق من اتصال قاعدة البيانات...\n');
  console.log('📋 الإعدادات المستخدمة:');
  console.log(`   المضيف (Host):     ${dbHost}`);
  console.log(`   المنفذ (Port):      ${dbPort}`);
  console.log(`   القاعدة (Database): ${dbName}`);
  console.log(`   المستخدم (User):    ${dbUser}`);
  console.log(`   كلمة المرور:        ${dbPassword ? '***' + dbPassword.slice(-4) : '(فارغة)'}\n`);

  let connection;
  try {
    console.log('⏳ محاولة الاتصال...');
    connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      connectTimeout: 10000
    });

    console.log('✅ نجح الاتصال بقاعدة البيانات!\n');

    // التحقق من الجداول الموجودة
    console.log('📊 الجداول الموجودة:');
    const [tables] = await connection.query('SHOW TABLES');
    
    if (tables.length === 0) {
      console.log('   ⚠️ لا توجد جداول في القاعدة (قاعدة فارغة)\n');
    } else {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   ✓ ${tableName}`);
      });
      console.log('');

      // عد السجلات في الجداول الرئيسية
      const mainTables = ['users', 'grades', 'student_records', 'lessons'];
      console.log('📈 عدد السجلات:');
      
      for (const tableName of mainTables) {
        try {
          const [rows] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
          console.log(`   ${tableName}: ${rows[0].count} سجل`);
        } catch (err) {
          // الجدول غير موجود
        }
      }
    }

    console.log('\n✅ قاعدة البيانات تعمل بشكل صحيح');
    return true;

  } catch (error) {
    console.error('\n❌ فشل الاتصال بقاعدة البيانات!\n');
    console.error('الخطأ:', error.message);
    console.error('الكود:', error.code);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 السبب المحتمل: خادم MySQL غير مشغل أو العنوان/المنفذ خاطئ');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 السبب المحتمل: اسم المستخدم أو كلمة المرور خاطئة');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 السبب المحتمل: قاعدة البيانات غير موجودة');
      console.error('   يمكنك إنشاؤها بتشغيل: node scripts/create_database.js');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.error('\n💡 السبب المحتمل: المضيف غير موجود أو لا يمكن الوصول إليه');
      console.error('   تأكد من صحة عنوان المضيف وأن الخدمة مفعلة على Railway');
    }
    
    return false;

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});

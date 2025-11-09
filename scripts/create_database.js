// سكربت لإنشاء قاعدة البيانات إذا كانت غير موجودة (للاستخدام المحلي أو عند توفر صلاحيات)
// ملاحظة: على Railway عادةً تُنشأ قاعدة البيانات تلقائياً ضمن خدمة MySQL ولا تحتاج لهذا السكربت.
// استخدم هذا فقط محلياً أو في بيئة لديك بها وصول root إلى الخادم.

require('dotenv').config();
const mysql = require('mysql2/promise');

// اختيار القيم (يفضل استخدام DB_* أو MYSQL_*)
const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'ecole_chebbi';
const host = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
const port = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);
const user = process.env.DB_USER || process.env.MYSQLUSER || 'root';
const password = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '';

async function ensureDatabase() {
  console.log('🔍 التحقق من وجود قاعدة البيانات:', dbName);
  let connection;
  try {
    connection = await mysql.createConnection({ host, port, user, password });
    const [rows] = await connection.query('SHOW DATABASES LIKE ?;', [dbName]);
    if (rows.length === 0) {
      console.log('⚠️ القاعدة غير موجودة، يجري إنشاؤها...');
      await connection.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
      console.log('✅ تم إنشاء قاعدة البيانات بنجاح.');
    } else {
      console.log('✅ قاعدة البيانات موجودة مسبقاً.');
    }
    console.log('ℹ️ الآن يمكنك تشغيل التطبيق: npm start');
  } catch (err) {
    console.error('❌ فشل إنشاء/التحقق من قاعدة البيانات:', err.message);
    console.error('💡 تأكد من صحة بيانات الدخول (المستخدم/كلمة المرور) وصلاحيات المستخدم لإنشاء قواعد جديدة.');
  } finally {
    if (connection) await connection.end();
  }
}

ensureDatabase();

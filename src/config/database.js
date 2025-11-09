const { Sequelize } = require('sequelize');

// اختيار مجموعة إعدادات متسقة: URL واحد أو DB_* أو MYSQL_* أو افتراضي محلي
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
  // استخدم DB_* فقط إذا كانت كاملة
  dbName = process.env.DB_NAME;
  dbUser = process.env.DB_USER;
  dbPassword = process.env.DB_PASSWORD;
  dbHost = process.env.DB_HOST;
  dbPort = Number(process.env.DB_PORT || 3306);
} else if (hasMYSQLSet) {
  // خلاف ذلك، استخدم MYSQL_* الخاصة بـ Railway إذا كانت كاملة
  dbName = process.env.MYSQLDATABASE;
  dbUser = process.env.MYSQLUSER;
  dbPassword = process.env.MYSQLPASSWORD;
  dbHost = process.env.MYSQLHOST;
  dbPort = Number(process.env.MYSQLPORT || 3306);
} else {
  // افتراضي محلي للتطوير فقط
  dbName = 'ecole_chebbi';
  dbUser = 'root';
  dbPassword = 'loi123';
  dbHost = 'localhost';
  dbPort = 3306;
}

// إنشاء اتصال Sequelize
const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false, // تعطيل سجلات SQL (يمكن تفعيلها للتطوير)
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  dialectOptions: {
    charset: 'utf8mb4'
  },
  define: {
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    timestamps: true
  }
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL متصل بنجاح');
    console.log(`📊 قاعدة البيانات: ${dbName}`);
    console.log(`🗄️ المضيف: ${dbHost}:${dbPort}`);
    
    // مزامنة النماذج مع قاعدة البيانات
    await sequelize.sync({ alter: false }); // استخدم { force: true } لحذف وإعادة إنشاء الجداول
    console.log('✅ تم مزامنة النماذج مع قاعدة البيانات');
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    console.error('� إعدادات الاتصال الحالية:');
    console.error(`   HOST=${dbHost} PORT=${dbPort} DB=${dbName} USER=${dbUser}`);
    if (process.env.RAILWAY_STATIC_URL || process.env.MYSQLHOST || process.env.MYSQL_URL || process.env.DATABASE_URL) {
      console.error('💡 يعمل التطبيق على Railway: تأكد من ربط متغيرات DB_* بقيم MYSQL* في إعدادات الخدمة، أو اترك الكود يقرأ MYSQL* تلقائياً.');
      console.error('   بدائل مدعومة أيضاً: MYSQL_URL أو DATABASE_URL بصيغة mysql://user:pass@host:port/db');
    } else {
      console.error('💡 محلياً: تأكد من تشغيل MySQL وصحة القيم في ملف .env.');
      console.error('   لإنشاء قاعدة البيانات محلياً:');
      console.error('   mysql -u root -p');
      console.error('   CREATE DATABASE ecole_chebbi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    }
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

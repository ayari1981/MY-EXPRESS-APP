const { Sequelize } = require('sequelize');

// قراءة متغيرات البيئة مع دعم تلقائي لمتغيرات Railway (MYSQL*)
const dbName = process.env.DB_NAME || process.env.MYSQLDATABASE || 'ecole_chebbi';
const dbUser = process.env.DB_USER || process.env.MYSQLUSER || 'root';
const dbPassword = process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || 'loi123';
const dbHost = process.env.DB_HOST || process.env.MYSQLHOST || 'localhost';
const dbPort = Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306);

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
    if (process.env.RAILWAY_STATIC_URL || process.env.MYSQLHOST) {
      console.error('💡 يعمل التطبيق على Railway: تأكد من ربط متغيرات DB_* بقيم MYSQL* في إعدادات الخدمة، أو اترك الكود يقرأ MYSQL* تلقائياً.');
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

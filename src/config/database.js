const { Sequelize } = require('sequelize');

// إنشاء اتصال Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecole_chebbi',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'loi123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
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
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL متصل بنجاح');
    console.log(`📊 قاعدة البيانات: ${process.env.DB_NAME}`);
    
    // مزامنة النماذج مع قاعدة البيانات
    await sequelize.sync({ alter: false }); // استخدم { force: true } لحذف وإعادة إنشاء الجداول
    console.log('✅ تم مزامنة النماذج مع قاعدة البيانات');
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    console.error('💡 تأكد من:');
    console.error('   1. تشغيل MySQL');
    console.error('   2. صحة بيانات الاتصال في ملف .env');
    console.error('   3. وجود قاعدة البيانات ecole_chebbi');
    console.error('');
    console.error('لإنشاء قاعدة البيانات، شغّل:');
    console.error('mysql -u root -p');
    console.error('CREATE DATABASE ecole_chebbi CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };

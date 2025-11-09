// سكربت لمزامنة النماذج مع قاعدة البيانات والتأكد من وجود الجداول
require('dotenv').config();
const { sequelize, connectDB } = require('../src/config/database');
const models = require('../src/models');

async function syncModels() {
  console.log('🔄 بدء مزامنة النماذج مع قاعدة البيانات...\n');
  
  try {
    // الاتصال بقاعدة البيانات
    await connectDB();
    
    console.log('\n📋 النماذج المسجلة:');
    const modelNames = Object.keys(sequelize.models);
    modelNames.forEach(name => {
      console.log(`   ✓ ${name}`);
    });
    
    console.log(`\n📊 إجمالي النماذج: ${modelNames.length}\n`);
    
    // مزامنة الجداول (إنشاء الجداول المفقودة دون حذف البيانات)
    console.log('⏳ جاري المزامنة...');
    await sequelize.sync({ alter: false });
    
    console.log('✅ تمت المزامنة بنجاح\n');
    
    // التحقق من الجداول الموجودة
    const [tables] = await sequelize.query('SHOW TABLES');
    console.log('📊 الجداول في قاعدة البيانات:');
    
    if (tables.length === 0) {
      console.log('   ⚠️ لا توجد جداول!');
    } else {
      tables.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   ✓ ${tableName}`);
      });
    }
    
    console.log(`\n📈 إجمالي الجداول: ${tables.length}`);
    
    // عد السجلات
    console.log('\n📊 عدد السجلات في كل جدول:');
    for (const modelName of modelNames) {
      try {
        const count = await sequelize.models[modelName].count();
        console.log(`   ${modelName}: ${count} سجل`);
      } catch (err) {
        console.log(`   ${modelName}: خطأ - ${err.message}`);
      }
    }
    
    console.log('\n✅ العملية مكتملة');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    console.error(error);
    process.exit(1);
  }
}

syncModels();

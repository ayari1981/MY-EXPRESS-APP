require('dotenv').config();
const mysql = require('mysql2/promise');

async function verifyRailwayDB() {
  console.log('🔍 التحقق من إعدادات Railway MySQL...\n');

  const config = {
    host: 'metro.proxy.rlwy.net',
    port: 51425,
    user: 'root',
    password: 'SWRwvEsAmiQYoxmesxpxOulHjwfeYUzt',
    database: 'railway'
  };

  console.log('📋 معلومات الاتصال:');
  console.log(`   HOST: ${config.host}`);
  console.log(`   PORT: ${config.port}`);
  console.log(`   DATABASE: ${config.database}`);
  console.log(`   USER: ${config.user}`);
  console.log(`   PASSWORD: ${config.password.substring(0, 4)}...${config.password.substring(config.password.length - 4)}\n`);

  try {
    console.log('⏳ جاري الاتصال...');
    const connection = await mysql.createConnection(config);
    console.log('✅ الاتصال نجح!\n');

    // عرض الجداول
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📊 عدد الجداول: ${tables.length}`);
    tables.forEach(t => console.log(`   - ${Object.values(t)[0]}`));

    // عرض عدد السجلات
    console.log('\n📈 عدد السجلات في كل جدول:');
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [count] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   ${tableName}: ${count[0].count}`);
    }

    console.log('\n✅ قاعدة البيانات تعمل بشكل صحيح!');
    console.log('\n📝 الخطوة التالية:');
    console.log('   أضف هذا المتغير في Railway Variables:');
    console.log('   MYSQL_URL=mysql://root:SWRwvEsAmiQYoxmesxpxOulHjwfeYUzt@metro.proxy.rlwy.net:51425/railway');

    await connection.end();
  } catch (error) {
    console.error('❌ فشل الاتصال:', error.message);
    console.log('\n💡 تحقق من:');
    console.log('   1. أن قاعدة البيانات Railway لم يتم حذفها');
    console.log('   2. أن كلمة المرور صحيحة');
    console.log('   3. أن المنفذ 51425 مفتوح');
  }
}

verifyRailwayDB();

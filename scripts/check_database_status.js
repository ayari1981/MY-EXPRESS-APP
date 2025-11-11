// سكريبت للتحقق من حالة قاعدة البيانات والتحديثات
require('dotenv').config();
const path = require('path');
const { connectDB, sequelize } = require(path.join(__dirname, '..', 'src', 'config', 'database'));

async function checkDatabaseStatus() {
  try {
    await connectDB();
    
    console.log('🔍 فحص حالة قاعدة البيانات...\n');
    
    // 1. التحقق من المدير
    console.log('1️⃣ حالة المدير:');
    const [adminResults] = await sequelize.query(`
      SELECT id, name, email, role, created_at, updated_at 
      FROM users 
      WHERE role = 'admin' 
      LIMIT 1
    `);
    
    if (adminResults.length > 0) {
      const admin = adminResults[0];
      console.log(`   ✅ المدير موجود: ${admin.name} (${admin.email})`);
      console.log(`   📅 آخر تحديث: ${admin.updated_at}`);
    } else {
      console.log('   ❌ لا يوجد حساب مدير');
    }
    
    // 2. التحقق من هيكل جدول الدروس
    console.log('\n2️⃣ هيكل جدول الدروس:');
    const [lessonColumns] = await sequelize.query(`
      DESCRIBE lessons
    `);
    
    const classColumn = lessonColumns.find(col => col.Field === 'class');
    if (classColumn) {
      console.log(`   ✅ نوع حقل class: ${classColumn.Type}`);
      console.log(`   📝 القيم المسموحة: ${classColumn.Type.includes('varchar') ? 'أي نص (مرن)' : classColumn.Type}`);
    }
    
    // 3. إحصائيات الجداول
    console.log('\n3️⃣ إحصائيات الجداول:');
    
    const tables = ['users', 'lessons', 'notifications', 'student_records', 'grades'];
    
    for (const table of tables) {
      try {
        const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   📊 ${table}: ${countResult[0].count} سجل`);
      } catch (error) {
        console.log(`   ❌ ${table}: خطأ في الوصول`);
      }
    }
    
    // 4. التحقق من الجلسات
    console.log('\n4️⃣ جلسات المستخدمين:');
    try {
      const [sessionCount] = await sequelize.query(`SELECT COUNT(*) as count FROM sessions`);
      console.log(`   🔐 الجلسات النشطة: ${sessionCount[0].count}`);
    } catch (error) {
      console.log('   ℹ️ جدول الجلسات غير موجود أو فارغ');
    }
    
    console.log('\n✅ انتهى فحص قاعدة البيانات');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ خطأ في فحص قاعدة البيانات:', error.message);
    process.exit(1);
  }
}

checkDatabaseStatus();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config(); // تحميل متغيرات البيئة من .env

async function runMigration() {
  // استخدام إعدادات Railway من .env
  const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  };

  console.log('🔌 Connecting to Railway MySQL...');
  console.log(`📊 Database: ${dbConfig.database}`);
  console.log(`🖥️  Host: ${dbConfig.host}:${dbConfig.port}\n`);

  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log('✅ Connected to Railway MySQL database!\n');

    // قراءة SQL migration
    const sqlFile = fs.readFileSync(path.join(__dirname, 'create_grades_table.sql'), 'utf8');
    
    console.log('📄 SQL file content length:', sqlFile.length, 'characters\n');
    
    // تقسيم SQL إلى statements منفصلة (تجاهل التعليقات والأسطر الفارغة)
    const statements = sqlFile
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`📝 Found ${statements.length} SQL statements to execute...\n`);

    // تنفيذ كل statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        await connection.query(statement);
        console.log(`✅ Statement ${i + 1} executed successfully\n`);
      } catch (error) {
        // إذا كان الخطأ "column already exists" أو "table already exists" نتجاهله
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log(`⚠️  Statement ${i + 1} skipped (already exists)\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('✨ Migration completed successfully!');
    console.log('\n📊 Verifying tables...');

    // التحقق من الجداول
    const [tables] = await connection.query("SHOW TABLES LIKE 'grades'");
    if (tables.length > 0) {
      console.log('✅ Table "grades" exists');
      
      // عرض بنية الجدول
      const [columns] = await connection.query('DESCRIBE grades');
      console.log('\n📋 Grades table structure:');
      columns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
      });
    }

    // التحقق من حقول users
    const [userColumns] = await connection.query("SHOW COLUMNS FROM users LIKE 'child_%'");
    if (userColumns.length > 0) {
      console.log('\n✅ Child fields added to users table:');
      userColumns.forEach(col => {
        console.log(`   - ${col.Field}: ${col.Type}`);
      });
    }

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('\n🔌 Database connection closed');
  }
}

// تشغيل Migration
runMigration()
  .then(() => {
    console.log('\n🎉 All done! Your grades system is ready to use!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });

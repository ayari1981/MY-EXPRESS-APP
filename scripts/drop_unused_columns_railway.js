const { sequelize } = require('../src/config/database');

async function dropUnusedColumns() {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بنجاح');

    // التحقق من وجود الأعمدة أولاً
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME IN ('class_section', 'student_section')
    `);

    console.log(`\n📋 الأعمدة الموجودة للحذف: ${columns.length}`);
    
    if (columns.length === 0) {
      console.log('✅ لا توجد أعمدة للحذف - قاعدة البيانات محدثة بالفعل');
      process.exit(0);
    }

    // حذف الأعمدة غير المستخدمة
    for (const col of columns) {
      const columnName = col.COLUMN_NAME;
      console.log(`\n🗑️ جاري حذف العمود: ${columnName}`);
      
      try {
        await sequelize.query(`ALTER TABLE users DROP COLUMN ${columnName}`);
        console.log(`✅ تم حذف ${columnName} بنجاح`);
      } catch (error) {
        console.error(`❌ خطأ في حذف ${columnName}:`, error.message);
      }
    }

    console.log('\n✅ اكتملت عملية تنظيف قاعدة البيانات');
    
    // التحقق النهائي
    const [remainingCols] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'users'
    `);
    
    console.log(`\n📊 إجمالي الأعمدة في جدول users: ${remainingCols.length}`);
    console.log('الأعمدة:', remainingCols.map(c => c.COLUMN_NAME).join(', '));

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error(error);
    process.exit(1);
  }
}

dropUnusedColumns();

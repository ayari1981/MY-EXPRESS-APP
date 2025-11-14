// تصحيح جميع قيم القسم في قاعدة البيانات
require('dotenv').config();
const db = require('../src/models');
const { Grade, StudentRecord } = db;
const sequelize = db.sequelize;

async function fixAllClassValues() {
  try {
    console.log('🔧 تصحيح جميع قيم القسم في قاعدة البيانات...\n');

    const mapping = {
      '7 أساسي': 'السابعة أساسي',
      '8 أساسي': 'الثامنة أساسي',
      '9 أساسي': 'التاسعة أساسي'
    };

    let totalFixed = 0;

    // 1. إصلاح جدول grades
    console.log('1️⃣ تصحيح جدول النتائج (grades):');
    for (const [oldValue, newValue] of Object.entries(mapping)) {
      const [affectedRows] = await sequelize.query(
        `UPDATE grades SET student_class = ? WHERE student_class = ?`,
        { replacements: [newValue, oldValue] }
      );
      if (affectedRows > 0) {
        console.log(`   ✓ تم تحديث ${affectedRows} سجل: "${oldValue}" → "${newValue}"`);
        totalFixed += affectedRows;
      }
    }

    // 2. إصلاح جدول student_records
    console.log('\n2️⃣ تصحيح جدول سجلات الطلاب (student_records):');
    for (const [oldValue, newValue] of Object.entries(mapping)) {
      const [affectedRows] = await sequelize.query(
        `UPDATE student_records SET student_class = ? WHERE student_class = ?`,
        { replacements: [newValue, oldValue] }
      );
      if (affectedRows > 0) {
        console.log(`   ✓ تم تحديث ${affectedRows} سجل: "${oldValue}" → "${newValue}"`);
        totalFixed += affectedRows;
      }
    }

    console.log(`\n✅ تم تصحيح ${totalFixed} سجل بنجاح!`);
    
    // التحقق
    console.log('\n🔍 التحقق من النتائج:');
    const [gradesCheck] = await sequelize.query(
      `SELECT DISTINCT student_class FROM grades ORDER BY student_class`
    );
    console.log('   جدول grades:', gradesCheck.map(g => g.student_class).join(', '));
    
    const [recordsCheck] = await sequelize.query(
      `SELECT DISTINCT student_class FROM student_records ORDER BY student_class`
    );
    console.log('   جدول student_records:', recordsCheck.map(r => r.student_class).join(', '));

    await sequelize.close();
    console.log('\n✅ اكتمل التصحيح!');
  } catch (err) {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  }
}

fixAllClassValues();

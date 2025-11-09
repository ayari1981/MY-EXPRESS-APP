require('dotenv').config();
const { Lesson } = require('../src/models');
const fs = require('fs');
const path = require('path');

async function cleanupOldLessons() {
  console.log('🧹 تنظيف الدروس القديمة...\n');

  try {
    const allLessons = await Lesson.findAll();
    console.log(`📊 وجدنا ${allLessons.length} درس في قاعدة البيانات\n`);

    let deletedCount = 0;
    let keptCount = 0;

    for (const lesson of allLessons) {
      const filePath = path.join(__dirname, '../', lesson.fileUrl);
      const fileExists = fs.existsSync(filePath);

      if (!fileExists) {
        console.log(`❌ حذف: ${lesson.title} (الملف غير موجود)`);
        await lesson.destroy();
        deletedCount++;
      } else {
        console.log(`✅ احتفاظ: ${lesson.title}`);
        keptCount++;
      }
    }

    console.log(`\n📈 النتيجة:`);
    console.log(`   ✅ احتفظنا بـ ${keptCount} درس`);
    console.log(`   ❌ حذفنا ${deletedCount} درس قديم`);

    if (deletedCount > 0) {
      console.log(`\n💡 تم حذف الدروس القديمة التي ملفاتها مفقودة`);
      console.log(`   يمكن للأساتذة الآن رفع دروس جديدة بدون أخطاء`);
    } else {
      console.log(`\n✅ جميع الدروس ملفاتها موجودة!`);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    process.exit(1);
  }
}

cleanupOldLessons();

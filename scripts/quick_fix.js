require('dotenv').config();
const { User, Notification, Lesson } = require('../src/models');
const bcrypt = require('bcryptjs');

async function quickFix() {
  console.log('🔧 إصلاح سريع للمشاكل الشائعة\n');

  try {
    // 1. التأكد من وجود حساب المسؤول
    console.log('1️⃣ التحقق من حساب المسؤول...');
    let admin = await User.findOne({ where: { email: 'admin@ecole-chebbi.tn' } });
    
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        name: 'المسؤول',
        email: 'admin@ecole-chebbi.tn',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('   ✅ تم إنشاء حساب المسؤول');
    } else {
      // تحديث كلمة المرور للتأكد
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await admin.update({ password: hashedPassword });
      console.log('   ✅ حساب المسؤول موجود (تم تحديث كلمة المرور)');
    }

    // 2. تحديث studentClass للتلاميذ
    console.log('\n2️⃣ تحديث أقسام التلاميذ...');
    const studentsWithoutClass = await User.count({
      where: { role: 'student', studentClass: null }
    });

    if (studentsWithoutClass > 0) {
      await User.update(
        { studentClass: '7 أساسي' },
        { where: { role: 'student', studentClass: null } }
      );
      console.log(`   ✅ تم تحديث ${studentsWithoutClass} تلميذ إلى قسم "7 أساسي"`);
    } else {
      console.log('   ✅ جميع التلاميذ لديهم أقسام');
    }

    // 3. إحصائيات
    console.log('\n3️⃣ الإحصائيات:');
    const totalUsers = await User.count();
    const students = await User.count({ where: { role: 'student' } });
    const teachers = await User.count({ where: { role: 'teacher' } });
    const parents = await User.count({ where: { role: 'parent' } });
    const admins = await User.count({ where: { role: 'admin' } });
    const notifications = await Notification.count();
    const lessons = await Lesson.count();

    console.log(`   👥 المستخدمون: ${totalUsers}`);
    console.log(`      - تلاميذ: ${students}`);
    console.log(`      - أساتذة: ${teachers}`);
    console.log(`      - أولياء: ${parents}`);
    console.log(`      - مسؤولون: ${admins}`);
    console.log(`   🔔 الإشعارات: ${notifications}`);
    console.log(`   📚 الدروس: ${lessons}`);

    // 4. عرض عينة من التلاميذ
    console.log('\n4️⃣ عينة من التلاميذ:');
    const sampleStudents = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'studentClass'],
      limit: 5
    });

    sampleStudents.forEach(s => {
      console.log(`   ${s.id}. ${s.name} - ${s.studentClass || 'بدون قسم'}`);
    });

    // 5. إنشاء إشعار تجريبي
    if (students > 0) {
      console.log('\n5️⃣ إنشاء إشعار تجريبي...');
      const firstStudent = await User.findOne({ where: { role: 'student' } });
      
      await Notification.create({
        userId: firstStudent.id,
        title: 'إشعار تجريبي من النظام',
        message: 'تم إصلاح النظام بنجاح. يمكنك الآن استقبال الإشعارات!',
        isRead: false
      });
      
      console.log(`   ✅ تم إرسال إشعار تجريبي لـ ${firstStudent.name}`);
    }

    console.log('\n✅ الإصلاح اكتمل بنجاح!\n');
    console.log('📝 يمكنك الآن:');
    console.log('   1. تسجيل الدخول: admin@ecole-chebbi.tn / admin123');
    console.log('   2. إرسال إشعارات للتلاميذ');
    console.log('   3. رفع دروس\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    console.error(error);
    process.exit(1);
  }
}

quickFix();

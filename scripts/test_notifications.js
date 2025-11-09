require('dotenv').config();
const { User, Notification } = require('../src/models');

async function testNotifications() {
  console.log('🔔 اختبار نظام الإشعارات\n');

  try {
    // 1. عرض جميع التلاميذ
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'email', 'studentClass'],
      limit: 10
    });

    console.log(`📚 وجدنا ${students.length} تلميذ:`);
    students.forEach(s => {
      console.log(`   ${s.id}. ${s.name} - ${s.studentClass || 'بدون قسم'} (${s.email})`);
    });

    if (students.length === 0) {
      console.log('\n❌ لا يوجد تلاميذ في النظام!');
      process.exit(0);
    }

    // 2. إنشاء إشعار تجريبي لأول تلميذ
    const testStudent = students[0];
    
    console.log(`\n📝 إنشاء إشعار تجريبي لـ ${testStudent.name}...`);
    
    const notification = await Notification.create({
      userId: testStudent.id,
      title: 'إشعار تجريبي',
      message: 'هذا إشعار تجريبي للتأكد من عمل النظام',
      isRead: false
    });

    console.log('✅ تم إنشاء الإشعار:', {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message
    });

    // 3. عرض جميع الإشعارات
    const allNotifications = await Notification.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    console.log(`\n📊 آخر ${allNotifications.length} إشعارات:`);
    allNotifications.forEach(n => {
      console.log(`   ${n.id}. ${n.title} → ${n.user ? n.user.name : 'مستخدم محذوف'} (${n.isRead ? 'مقروء' : 'غير مقروء'})`);
    });

    // 4. إنشاء إشعار لكل التلاميذ في نفس القسم
    if (testStudent.studentClass) {
      console.log(`\n📢 إنشاء إشعار جماعي لقسم ${testStudent.studentClass}...`);
      
      const classStudents = await User.findAll({
        where: {
          role: 'student',
          studentClass: testStudent.studentClass
        }
      });

      const bulkNotifications = classStudents.map(student => ({
        userId: student.id,
        title: 'إشعار جماعي تجريبي',
        message: `رسالة لجميع تلاميذ ${testStudent.studentClass}`,
        isRead: false
      }));

      await Notification.bulkCreate(bulkNotifications);
      console.log(`✅ تم إرسال ${bulkNotifications.length} إشعار لقسم ${testStudent.studentClass}`);
    }

    console.log('\n✅ اختبار الإشعارات اكتمل بنجاح!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ خطأ:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testNotifications();

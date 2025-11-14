// فحص شامل لجميع الوظائف - اختبار آلي
require('dotenv').config();
const mysql = require('mysql2/promise');

async function comprehensiveTest() {
  let connection;
  try {
    console.log('🔍 فحص شامل لجميع الوظائف\n');

    // الاتصال
    const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL || '';
    const u = new URL(connectionUrl);
    
    connection = await mysql.createConnection({
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: (u.pathname || '').replace(/^\//, '')
    });

    let allPass = true;

    // 1. اختبار البيانات الأساسية
    console.log('1️⃣ اختبار البيانات الأساسية:');
    
    const [users] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role = "teacher"');
    console.log(`   ✓ عدد المعلمين: ${users[0].count}`);
    if (users[0].count === 0) {
      console.log('   ⚠️ لا يوجد معلمين في النظام');
      allPass = false;
    }
    
    const [students] = await connection.query('SELECT COUNT(*) as count FROM users WHERE role = "student"');
    console.log(`   ✓ عدد الطلاب: ${students[0].count}`);
    
    const [lessons] = await connection.query('SELECT COUNT(*) as count FROM lessons');
    console.log(`   ✓ عدد الدروس: ${lessons[0].count}`);

    // 2. اختبار صحة قيم القسم
    console.log('\n2️⃣ اختبار صحة قيم القسم:');
    
    const wrongPattern = /^\d/; // يبدأ برقم
    
    const [wrongUsers] = await connection.query(
      'SELECT COUNT(*) as count FROM users WHERE role = "student" AND student_class REGEXP "^[0-9]"'
    );
    if (wrongUsers[0].count > 0) {
      console.log(`   ❌ ${wrongUsers[0].count} طالب بقيم قسم خاطئة`);
      allPass = false;
    } else {
      console.log('   ✓ جميع قيم القسم في جدول users صحيحة');
    }
    
    const [wrongLessons] = await connection.query(
      'SELECT COUNT(*) as count FROM lessons WHERE student_class REGEXP "^[0-9]"'
    );
    if (wrongLessons[0].count > 0) {
      console.log(`   ❌ ${wrongLessons[0].count} درس بقيم قسم خاطئة`);
      allPass = false;
    } else {
      console.log('   ✓ جميع قيم القسم في جدول lessons صحيحة');
    }
    
    const [wrongGrades] = await connection.query(
      'SELECT COUNT(*) as count FROM grades WHERE student_class REGEXP "^[0-9]"'
    );
    if (wrongGrades[0].count > 0) {
      console.log(`   ❌ ${wrongGrades[0].count} نتيجة بقيم قسم خاطئة`);
      allPass = false;
    } else {
      console.log('   ✓ جميع قيم القسم في جدول grades صحيحة');
    }

    // 3. اختبار العلاقات بين الجداول
    console.log('\n3️⃣ اختبار العلاقات بين الجداول:');
    
    const [orphanLessons] = await connection.query(
      'SELECT COUNT(*) as count FROM lessons WHERE teacher_id NOT IN (SELECT id FROM users WHERE role = "teacher")'
    );
    if (orphanLessons[0].count > 0) {
      console.log(`   ⚠️ ${orphanLessons[0].count} درس بدون معلم`);
    } else {
      console.log('   ✓ جميع الدروس مرتبطة بمعلمين');
    }
    
    const [orphanGrades] = await connection.query(
      'SELECT COUNT(*) as count FROM grades WHERE student_id NOT IN (SELECT id FROM users WHERE role = "student")'
    );
    if (orphanGrades[0].count > 0) {
      console.log(`   ⚠️ ${orphanGrades[0].count} نتيجة بدون طالب`);
    } else {
      console.log('   ✓ جميع النتائج مرتبطة بطلاب');
    }

    // 4. اختبار التصفية
    console.log('\n4️⃣ اختبار التصفية حسب القسم والصف:');
    
    const [classLevels] = await connection.query(
      'SELECT DISTINCT student_class FROM users WHERE role = "student" ORDER BY student_class'
    );
    console.log('   الأقسام المتاحة:', classLevels.map(c => c.student_class).join(', '));
    
    for (const classLevel of classLevels) {
      const [studentsInClass] = await connection.query(
        'SELECT COUNT(*) as count FROM users WHERE role = "student" AND student_class = ?',
        [classLevel.student_class]
      );
      console.log(`   ✓ ${classLevel.student_class}: ${studentsInClass[0].count} طالب`);
      
      // اختبار الدروس للقسم
      const [lessonsForClass] = await connection.query(
        'SELECT COUNT(*) as count FROM lessons WHERE student_class = ?',
        [classLevel.student_class]
      );
      console.log(`      - الدروس: ${lessonsForClass[0].count}`);
      
      // اختبار النتائج للقسم
      const [gradesForClass] = await connection.query(
        'SELECT COUNT(*) as count FROM grades WHERE student_class = ?',
        [classLevel.student_class]
      );
      console.log(`      - النتائج: ${gradesForClass[0].count}`);
    }

    // 5. اختبار الإشعارات
    console.log('\n5️⃣ اختبار نظام الإشعارات:');
    
    const [notifications] = await connection.query('SELECT COUNT(*) as count FROM notifications');
    console.log(`   ✓ عدد الإشعارات: ${notifications[0].count}`);
    
    const [unreadNotifications] = await connection.query(
      'SELECT COUNT(*) as count FROM notifications WHERE is_read = 0'
    );
    console.log(`   ✓ غير المقروءة: ${unreadNotifications[0].count}`);

    // 6. اختبار سجلات الطلاب
    console.log('\n6️⃣ اختبار سجلات الطلاب:');
    
    const [records] = await connection.query('SELECT COUNT(*) as count FROM student_records');
    console.log(`   ✓ عدد السجلات: ${records[0].count}`);
    
    const [recordTypes] = await connection.query(
      'SELECT record_type, COUNT(*) as count FROM student_records GROUP BY record_type'
    );
    recordTypes.forEach(r => {
      console.log(`      - ${r.record_type}: ${r.count}`);
    });

    // النتيجة النهائية
    console.log('\n' + '='.repeat(50));
    if (allPass) {
      console.log('✅ جميع الاختبارات نجحت! النظام يعمل بشكل صحيح');
    } else {
      console.log('⚠️ بعض الاختبارات فشلت - تحقق من الأخطاء أعلاه');
    }
    console.log('='.repeat(50));

  } catch (err) {
    console.error('❌ خطأ:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

comprehensiveTest();

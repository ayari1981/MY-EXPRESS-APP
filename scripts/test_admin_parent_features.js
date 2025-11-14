// اختبار شامل لوظائف الإدارة والأولياء
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testAdminAndParentFeatures() {
  let connection;
  try {
    console.log('🔍 اختبار شامل لوظائف الإدارة والأولياء\n');

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

    console.log('=' .repeat(60));
    console.log('📊 اختبار وظائف الإدارة (Admin)');
    console.log('='.repeat(60));

    // 1. عدد المستخدمين حسب الدور
    console.log('\n1️⃣ إحصائيات المستخدمين:');
    const [userStats] = await connection.query(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role`
    );
    userStats.forEach(s => {
      const roleAr = {
        'admin': 'مسؤول',
        'teacher': 'معلم',
        'student': 'طالب',
        'parent': 'ولي أمر'
      }[s.role] || s.role;
      console.log(`   ✓ ${roleAr}: ${s.count}`);
    });

    // 2. اختبار عرض جميع النتائج (منشورة وغير منشورة)
    console.log('\n2️⃣ النتائج (منشورة وغير منشورة):');
    const [publishedGrades] = await connection.query(
      'SELECT COUNT(*) as count FROM grades WHERE is_published = 1'
    );
    const [unpublishedGrades] = await connection.query(
      'SELECT COUNT(*) as count FROM grades WHERE is_published = 0'
    );
    console.log(`   ✓ منشورة: ${publishedGrades[0].count}`);
    console.log(`   ✓ غير منشورة: ${unpublishedGrades[0].count}`);
    console.log(`   ✓ المجموع: ${publishedGrades[0].count + unpublishedGrades[0].count}`);

    // 3. اختبار الفلترة المتقدمة للنتائج
    console.log('\n3️⃣ اختبار فلترة النتائج حسب:');
    
    // حسب القسم
    const [gradesByClass] = await connection.query(
      `SELECT student_class, COUNT(*) as count FROM grades GROUP BY student_class ORDER BY student_class`
    );
    console.log('   📚 حسب القسم:');
    gradesByClass.forEach(g => {
      console.log(`      - ${g.student_class}: ${g.count} نتيجة`);
    });
    
    // حسب المادة
    const [gradesBySubject] = await connection.query(
      `SELECT subject, COUNT(*) as count FROM grades GROUP BY subject ORDER BY count DESC LIMIT 5`
    );
    console.log('   📖 حسب المادة (أعلى 5):');
    gradesBySubject.forEach(g => {
      console.log(`      - ${g.subject}: ${g.count} نتيجة`);
    });
    
    // حسب الفصل
    const [gradesBySemester] = await connection.query(
      `SELECT semester, COUNT(*) as count FROM grades GROUP BY semester ORDER BY semester`
    );
    console.log('   📅 حسب الفصل:');
    gradesBySemester.forEach(g => {
      console.log(`      - ${g.semester}: ${g.count} نتيجة`);
    });

    // 4. اختبار سجلات الطلاب (Student Records)
    console.log('\n4️⃣ سجلات الطلاب:');
    const [recordsByType] = await connection.query(
      `SELECT record_type, COUNT(*) as count FROM student_records GROUP BY record_type`
    );
    console.log('   حسب النوع:');
    recordsByType.forEach(r => {
      const typeAr = {
        'absence': 'غياب',
        'punishment': 'عقوبة',
        'note': 'ملاحظة'
      }[r.record_type] || r.record_type;
      console.log(`      - ${typeAr}: ${r.count}`);
    });

    // حسب القسم
    const [recordsByClass] = await connection.query(
      `SELECT student_class, COUNT(*) as count FROM student_records GROUP BY student_class ORDER BY student_class`
    );
    console.log('   حسب القسم:');
    recordsByClass.forEach(r => {
      console.log(`      - ${r.student_class}: ${r.count} سجل`);
    });

    // 5. اختبار سجلات الإدارة (Admin Logs)
    console.log('\n5️⃣ سجلات الإدارة (Admin Logs):');
    const [adminLogs] = await connection.query(
      'SELECT COUNT(*) as count FROM admin_logs'
    );
    console.log(`   ✓ عدد السجلات: ${adminLogs[0].count}`);
    
    if (adminLogs[0].count > 0) {
      const [recentLogs] = await connection.query(
        `SELECT action, COUNT(*) as count FROM admin_logs GROUP BY action ORDER BY count DESC LIMIT 5`
      );
      console.log('   آخر الإجراءات:');
      recentLogs.forEach(l => {
        console.log(`      - ${l.action}: ${l.count} مرة`);
      });
    }

    // 6. اختبار الدروس (للموافقة)
    console.log('\n6️⃣ حالة الدروس:');
    const [approvedLessons] = await connection.query(
      'SELECT COUNT(*) as count FROM lessons WHERE is_approved = 1'
    );
    const [pendingLessons] = await connection.query(
      'SELECT COUNT(*) as count FROM lessons WHERE is_approved = 0'
    );
    console.log(`   ✓ معتمدة: ${approvedLessons[0].count}`);
    console.log(`   ⏳ في انتظار الموافقة: ${pendingLessons[0].count}`);

    console.log('\n' + '='.repeat(60));
    console.log('👨‍👩‍👧 اختبار وظائف الأولياء (Parents)');
    console.log('='.repeat(60));

    // 1. عدد الأولياء وارتباطهم بالأبناء
    console.log('\n1️⃣ الأولياء وارتباطهم بالأبناء:');
    const [parents] = await connection.query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'parent'`
    );
    console.log(`   ✓ عدد الأولياء: ${parents[0].count}`);
    
    // الأولياء المرتبطون بأبناء
    const [linkedParents] = await connection.query(
      `SELECT COUNT(*) as count FROM users 
       WHERE role = 'parent' 
       AND child_first_name IS NOT NULL 
       AND child_first_name != ''`
    );
    console.log(`   ✓ مرتبطون بأبناء: ${linkedParents[0].count}`);
    console.log(`   ⚠️ غير مرتبطون: ${parents[0].count - linkedParents[0].count}`);

    // 2. اختبار ربط الأولياء بالطلاب
    console.log('\n2️⃣ اختبار الربط بين الأولياء والطلاب:');
    const [parentChildMatches] = await connection.query(
      `SELECT 
        p.id as parent_id,
        p.name as parent_name,
        p.child_first_name,
        p.child_last_name,
        s.id as student_id,
        s.name as student_name,
        s.student_class
      FROM users p
      LEFT JOIN users s ON (
        s.role = 'student' 
        AND s.name LIKE CONCAT('%', p.child_first_name, '%')
        AND s.name LIKE CONCAT('%', p.child_last_name, '%')
      )
      WHERE p.role = 'parent'
      AND p.child_first_name IS NOT NULL
      AND p.child_first_name != ''
      LIMIT 5`
    );
    
    if (parentChildMatches.length > 0) {
      console.log('   أمثلة على الربط:');
      parentChildMatches.forEach(m => {
        if (m.student_id) {
          console.log(`   ✓ ${m.parent_name} → ${m.student_name} (${m.student_class})`);
        } else {
          console.log(`   ⚠️ ${m.parent_name} → لا يوجد طالب مطابق لـ "${m.child_first_name} ${m.child_last_name}"`);
        }
      });
    } else {
      console.log('   ⚠️ لا توجد أمثلة على الربط');
    }

    // 3. اختبار نتائج الأبناء (من وجهة نظر الولي)
    console.log('\n3️⃣ نتائج الأبناء (المنشورة فقط):');
    const [parentGradesAccess] = await connection.query(
      `SELECT 
        COUNT(DISTINCT p.id) as parents_count,
        COUNT(g.id) as grades_count
      FROM users p
      LEFT JOIN users s ON (
        s.role = 'student'
        AND s.name LIKE CONCAT('%', p.child_first_name, '%')
      )
      LEFT JOIN grades g ON (
        g.student_id = s.id
        AND g.is_published = 1
      )
      WHERE p.role = 'parent'
      AND p.child_first_name IS NOT NULL`
    );
    console.log(`   ✓ الأولياء الذين يمكنهم رؤية النتائج: ${parentGradesAccess[0].parents_count}`);
    console.log(`   ✓ عدد النتائج المتاحة للأولياء: ${parentGradesAccess[0].grades_count}`);

    // 4. اختبار سجلات الأبناء (من وجهة نظر الولي)
    console.log('\n4️⃣ سجلات الأبناء (غياب، عقوبات):');
    const [parentRecordsAccess] = await connection.query(
      `SELECT 
        COUNT(DISTINCT p.id) as parents_count,
        COUNT(sr.id) as records_count
      FROM users p
      LEFT JOIN users s ON (
        s.role = 'student'
        AND s.name LIKE CONCAT('%', p.child_first_name, '%')
      )
      LEFT JOIN student_records sr ON sr.student_id = s.id
      WHERE p.role = 'parent'
      AND p.child_first_name IS NOT NULL`
    );
    console.log(`   ✓ الأولياء الذين يمكنهم رؤية السجلات: ${parentRecordsAccess[0].parents_count}`);
    console.log(`   ✓ عدد السجلات المتاحة للأولياء: ${parentRecordsAccess[0].records_count}`);

    // 5. اختبار التغذية الراجعة من الأولياء
    console.log('\n5️⃣ التغذية الراجعة (Feedback):');
    const [feedbacks] = await connection.query(
      'SELECT COUNT(*) as count FROM feedbacks'
    );
    console.log(`   ✓ عدد الرسائل: ${feedbacks[0].count}`);
    
    if (feedbacks[0].count > 0) {
      const [feedbackStats] = await connection.query(
        `SELECT 
          SUM(CASE WHEN status = 'responded' THEN 1 ELSE 0 END) as responded_count,
          SUM(CASE WHEN status = 'reviewed' THEN 1 ELSE 0 END) as reviewed_count,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count
        FROM feedbacks`
      );
      console.log(`   ✓ تم الرد عليها: ${feedbackStats[0].responded_count || 0}`);
      console.log(`   ✓ تمت مراجعتها: ${feedbackStats[0].reviewed_count || 0}`);
      console.log(`   ⏳ في الانتظار: ${feedbackStats[0].pending_count || 0}`);
    }

    // 6. اختبار الإشعارات للأولياء
    console.log('\n6️⃣ الإشعارات للأولياء:');
    const [parentNotifications] = await connection.query(
      `SELECT COUNT(DISTINCT n.id) as count
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      WHERE u.role = 'parent'`
    );
    console.log(`   ✓ عدد الإشعارات: ${parentNotifications[0].count}`);

    // النتيجة النهائية
    console.log('\n' + '='.repeat(60));
    console.log('📋 ملخص الاختبار');
    console.log('='.repeat(60));
    
    let issues = [];
    
    // فحص المشاكل المحتملة
    if (unpublishedGrades[0].count > 0) {
      issues.push(`⚠️ يوجد ${unpublishedGrades[0].count} نتيجة غير منشورة`);
    }
    
    if (pendingLessons[0].count > 0) {
      issues.push(`⚠️ يوجد ${pendingLessons[0].count} درس في انتظار الموافقة`);
    }
    
    if (parents[0].count - linkedParents[0].count > 0) {
      issues.push(`⚠️ يوجد ${parents[0].count - linkedParents[0].count} ولي أمر غير مرتبط بابن`);
    }

    if (issues.length > 0) {
      console.log('\n⚠️ ملاحظات:');
      issues.forEach(issue => console.log(`   ${issue}`));
    } else {
      console.log('\n✅ لا توجد مشاكل - جميع الوظائف تعمل بشكل صحيح!');
    }

    console.log('\n✅ اكتمل اختبار وظائف الإدارة والأولياء!');
    console.log('='.repeat(60));

  } catch (err) {
    console.error('❌ خطأ:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

testAdminAndParentFeatures();

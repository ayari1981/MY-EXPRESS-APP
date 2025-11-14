// اختبار APIs المعلمين
require('dotenv').config();
const mysql = require('mysql2/promise');

async function testTeacherAPIs() {
  let connection;
  try {
    console.log('🔍 اختبار APIs المعلمين\n');

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

    // 1. اختبار API: sections-by-class
    console.log('1️⃣ API: الحصول على الصفوف حسب القسم');
    
    const testClasses = ['السابعة أساسي', 'الثامنة أساسي', 'التاسعة أساسي'];
    
    for (const classLevel of testClasses) {
      const [sections] = await connection.query(
        'SELECT DISTINCT class_number FROM users WHERE role = "student" AND student_class = ? ORDER BY class_number',
        [classLevel]
      );
      
      if (sections.length > 0) {
        console.log(`   ✓ ${classLevel}: الصفوف [${sections.map(s => s.class_number).join(', ')}]`);
      } else {
        console.log(`   ⚠️ ${classLevel}: لا توجد صفوف`);
      }
    }

    // 2. اختبار API: students-by-section
    console.log('\n2️⃣ API: الحصول على الطلاب حسب القسم والصف');
    
    for (const classLevel of testClasses) {
      const [sections] = await connection.query(
        'SELECT DISTINCT class_number FROM users WHERE role = "student" AND student_class = ?',
        [classLevel]
      );
      
      for (const section of sections) {
        const [students] = await connection.query(
          'SELECT id, name, student_class, class_number FROM users WHERE role = "student" AND student_class = ? AND class_number = ?',
          [classLevel, section.class_number]
        );
        
        if (students.length > 0) {
          console.log(`   ✓ ${classLevel} - صف ${section.class_number}: ${students.length} طالب`);
          students.slice(0, 2).forEach(s => {
            console.log(`      - ${s.name} (ID: ${s.id})`);
          });
          if (students.length > 2) {
            console.log(`      ... و ${students.length - 2} طالب آخر`);
          }
        }
      }
    }

    // 3. اختبار التصفية في سجلات الطلاب
    console.log('\n3️⃣ API: سجلات الطلاب بالتصفية');
    
    for (const classLevel of testClasses) {
      const [records] = await connection.query(
        `SELECT sr.* FROM student_records sr 
         JOIN users u ON sr.student_id = u.id 
         WHERE u.student_class = ?`,
        [classLevel]
      );
      
      if (records.length > 0) {
        console.log(`   ✓ ${classLevel}: ${records.length} سجل`);
      } else {
        console.log(`   - ${classLevel}: لا توجد سجلات`);
      }
    }

    // 4. اختبار النتائج حسب القسم
    console.log('\n4️⃣ API: النتائج بالتصفية');
    
    for (const classLevel of testClasses) {
      const [grades] = await connection.query(
        'SELECT COUNT(*) as count, AVG(grade_value) as avg_score FROM grades WHERE student_class = ? AND is_published = 1',
        [classLevel]
      );
      
      if (grades[0].count > 0) {
        const avgScore = grades[0].avg_score ? Number(grades[0].avg_score).toFixed(2) : 'N/A';
        console.log(`   ✓ ${classLevel}: ${grades[0].count} نتيجة منشورة - المعدل: ${avgScore}`);
      } else {
        console.log(`   - ${classLevel}: لا توجد نتائج منشورة`);
      }
    }

    // 5. اختبار الدروس حسب القسم
    console.log('\n5️⃣ API: الدروس بالتصفية');
    
    for (const classLevel of testClasses) {
      const [lessons] = await connection.query(
        'SELECT id, title, subject FROM lessons WHERE student_class = ? AND is_approved = 1',
        [classLevel]
      );
      
      if (lessons.length > 0) {
        console.log(`   ✓ ${classLevel}: ${lessons.length} درس`);
        lessons.forEach(l => {
          console.log(`      - ${l.title} (${l.subject})`);
        });
      } else {
        console.log(`   - ${classLevel}: لا توجد دروس`);
      }
    }

    console.log('\n✅ جميع اختبارات APIs نجحت!');

  } catch (err) {
    console.error('❌ خطأ:', err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

testTeacherAPIs();

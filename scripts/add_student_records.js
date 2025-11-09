require('dotenv').config();
const mysql = require('mysql2/promise');

async function addStudentRecords() {
  let connection;
  
  try {
    console.log('📝 بدء إضافة سجلات التلاميذ...');
    
    // الاتصال بقاعدة البيانات
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ تم الاتصال بقاعدة البيانات');
    
    // الحصول على مستخدم إداري
    const [admins] = await connection.query(`
      SELECT id, name FROM users WHERE role = 'admin' LIMIT 1
    `);
    
    let adminId, adminName;
    if (admins.length > 0) {
      adminId = admins[0].id;
      adminName = admins[0].name;
    } else {
      // استخدام أول معلم كبديل
      const [teachers] = await connection.query(`
        SELECT id, name FROM users WHERE role = 'teacher' LIMIT 1
      `);
      if (teachers.length > 0) {
        adminId = teachers[0].id;
        adminName = teachers[0].name;
      } else {
        console.error('❌ لا يوجد مستخدمين إداريين أو معلمين!');
        await connection.end();
        process.exit(1);
      }
    }
    
    console.log(`👤 المسجل: ${adminName} (ID: ${adminId})`);
    
    // الحصول على جميع التلاميذ من جدول users
    const [students] = await connection.query(`
      SELECT id, name, student_class, email 
      FROM users 
      WHERE role = 'student' 
      AND student_class IS NOT NULL
    `);
    
    console.log(`\n👨‍🎓 تم العثور على ${students.length} تلميذ`);
    
    let addedCount = 0;
    const currentYear = '2024-2025';
    
    for (const student of students) {
      try {
        // استخراج الاسم الأول والأخير
        const nameParts = student.name.split(' ');
        const firstName = nameParts[0] || student.name;
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // استخراج معلومات القسم
        const classInfo = student.student_class || '';
        let classNumber = '';
        let section = '';
        
        // مثال: "7 أساسي أ" -> classNumber = "7", section = "أ"
        const match = classInfo.match(/(\d+)\s*(?:أساسي)?\s*([أ-ي])?/);
        if (match) {
          classNumber = match[1];
          section = match[2] || 'أ';
        }
        
        // التحقق من عدم وجود السجل
        const [existing] = await connection.query(
          'SELECT id FROM student_records WHERE student_id = ? AND academic_year = ?',
          [student.id, currentYear]
        );
        
        if (existing.length > 0) {
          console.log(`⚠️  ${student.name} - السجل موجود بالفعل`);
          continue;
        }
        
        // إضافة السجل (ملاحظة ترحيبية)
        await connection.query(`
          INSERT INTO student_records 
          (student_id, student_first_name, student_last_name, student_class, class_number, 
           record_type, date, description, recorded_by, recorded_by_name, recorded_by_role, 
           academic_year, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, 'note', CURDATE(), 'مرحباً بالتلميذ في السنة الدراسية الجديدة', ?, ?, 'admin', ?, NOW(), NOW())
        `, [student.id, firstName, lastName, classInfo, classNumber, adminId, adminName, currentYear]);
        
        addedCount++;
        console.log(`✅ ${student.name} - القسم: ${classNumber} ${section} - السنة: ${currentYear}`);
        
      } catch (error) {
        console.error(`❌ خطأ في إضافة ${student.name}:`, error.message);
      }
    }
    
    console.log(`\n✅ تم إضافة ${addedCount} سجل للتلاميذ بنجاح!`);
    console.log(`📊 السنة الدراسية: ${currentYear}`);
    
    await connection.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

addStudentRecords();

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function addSampleUsers() {
  let connection;
  
  try {
    console.log('👥 بدء إضافة المستخدمين النموذجيين...');
    
    // الاتصال بقاعدة البيانات
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ تم الاتصال بقاعدة البيانات');
    
    // كلمة مرور مشفرة (password: 123456)
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // 1. إضافة المعلمين
    console.log('\n👨‍🏫 إضافة المعلمين...');
    const teachers = [
      { name: 'محمد العلوي', email: 'mohamed.alaoui@school.tn', subject: 'الرياضيات' },
      { name: 'فاطمة السعيدي', email: 'fatma.saidi@school.tn', subject: 'الفرنسية' },
      { name: 'أحمد التونسي', email: 'ahmed.tounsi@school.tn', subject: 'العربية' },
      { name: 'سلمى الهاني', email: 'salma.hani@school.tn', subject: 'الإنجليزية' },
      { name: 'يوسف القاسمي', email: 'youssef.kasmi@school.tn', subject: 'العلوم' },
      { name: 'نادية المنصوري', email: 'nadia.mansouri@school.tn', subject: 'التاريخ' },
      { name: 'كريم الزهراوي', email: 'karim.zahraoui@school.tn', subject: 'الجغرافيا' },
      { name: 'ليلى البوعزيزي', email: 'leila.bouazizi@school.tn', subject: 'الفيزياء' }
    ];
    
    for (const teacher of teachers) {
      try {
        await connection.query(
          `INSERT INTO users (name, email, password, role, teacher_subject, created_at, updated_at) 
           VALUES (?, ?, ?, 'teacher', ?, NOW(), NOW())`,
          [teacher.name, teacher.email, hashedPassword, teacher.subject]
        );
        console.log(`✅ تم إضافة المعلم: ${teacher.name} - ${teacher.subject}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  ${teacher.name} موجود بالفعل`);
        } else {
          console.error(`❌ خطأ في إضافة ${teacher.name}:`, error.message);
        }
      }
    }
    
    // 2. إضافة الأولياء
    console.log('\n👪 إضافة الأولياء...');
    const parents = [
      { name: 'عبد الله بن علي', email: 'abdallah.benali@gmail.com', phone: '22123456' },
      { name: 'حليمة الصغير', email: 'halima.saghir@gmail.com', phone: '22234567' },
      { name: 'رشيد الكريمي', email: 'rachid.krimi@gmail.com', phone: '22345678' },
      { name: 'سعاد الجزيري', email: 'souad.jziri@gmail.com', phone: '22456789' },
      { name: 'منصف الشريف', email: 'manssef.chrif@gmail.com', phone: '22567890' },
      { name: 'زينب المسعودي', email: 'zaineb.mesaoudi@gmail.com', phone: '22678901' },
      { name: 'طارق الناصري', email: 'tarek.nasri@gmail.com', phone: '22789012' },
      { name: 'نجلاء الحمروني', email: 'najla.hamrouni@gmail.com', phone: '22890123' },
      { name: 'سامي الزغلامي', email: 'sami.zaghlami@gmail.com', phone: '22901234' },
      { name: 'هالة التليلي', email: 'hala.tlili@gmail.com', phone: '23012345' }
    ];
    
    const parentIds = [];
    for (const parent of parents) {
      try {
        const [result] = await connection.query(
          `INSERT INTO users (name, email, password, parent_phone, role, created_at, updated_at) 
           VALUES (?, ?, ?, ?, 'parent', NOW(), NOW())`,
          [parent.name, parent.email, hashedPassword, parent.phone]
        );
        parentIds.push(result.insertId);
        console.log(`✅ تم إضافة الولي: ${parent.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  ${parent.name} موجود بالفعل`);
          // الحصول على ID إذا كان موجود
          const [existing] = await connection.query(
            'SELECT id FROM users WHERE email = ?', [parent.email]
          );
          if (existing.length > 0) parentIds.push(existing[0].id);
        } else {
          console.error(`❌ خطأ في إضافة ${parent.name}:`, error.message);
          parentIds.push(null);
        }
      }
    }
    
    // 3. إضافة التلاميذ
    console.log('\n👨‍🎓 إضافة التلاميذ...');
    const students = [
      { name: 'أمين بن علي', email: 'amine.benali@student.tn', class: '7 أساسي أ', parentIndex: 0 },
      { name: 'ياسمين الصغير', email: 'yasmine.saghir@student.tn', class: '7 أساسي أ', parentIndex: 1 },
      { name: 'عمر الكريمي', email: 'omar.krimi@student.tn', class: '8 أساسي ب', parentIndex: 2 },
      { name: 'سارة الجزيري', email: 'sara.jziri@student.tn', class: '8 أساسي ب', parentIndex: 3 },
      { name: 'هشام الشريف', email: 'hichem.chrif@student.tn', class: '9 أساسي أ', parentIndex: 4 },
      { name: 'مريم المسعودي', email: 'mariem.mesaoudi@student.tn', class: '9 أساسي أ', parentIndex: 5 },
      { name: 'معاذ الناصري', email: 'mouadh.nasri@student.tn', class: '7 أساسي ب', parentIndex: 6 },
      { name: 'إيمان الحمروني', email: 'imen.hamrouni@student.tn', class: '8 أساسي أ', parentIndex: 7 },
      { name: 'بلال الزغلامي', email: 'bilel.zaghlami@student.tn', class: '7 أساسي أ', parentIndex: 8 },
      { name: 'نور التليلي', email: 'nour.tlili@student.tn', class: '9 أساسي ب', parentIndex: 9 },
      { name: 'حمزة بن علي', email: 'hamza.benali@student.tn', class: '8 أساسي أ', parentIndex: 0 },
      { name: 'رحمة الصغير', email: 'rahma.saghir@student.tn', class: '9 أساسي أ', parentIndex: 1 },
      { name: 'زياد الكريمي', email: 'zied.krimi@student.tn', class: '7 أساسي ب', parentIndex: 2 },
      { name: 'سلسبيل الجزيري', email: 'salsabil.jziri@student.tn', class: '8 أساسي ب', parentIndex: 3 },
      { name: 'آدم الشريف', email: 'adam.chrif@student.tn', class: '9 أساسي ب', parentIndex: 4 }
    ];
    
    for (const student of students) {
      try {
        const parentId = parentIds[student.parentIndex];
        await connection.query(
          `INSERT INTO users (name, email, password, role, student_class, parent_id, created_at, updated_at) 
           VALUES (?, ?, ?, 'student', ?, ?, NOW(), NOW())`,
          [student.name, student.email, hashedPassword, student.class, parentId]
        );
        console.log(`✅ تم إضافة التلميذ: ${student.name} - ${student.class}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  ${student.name} موجود بالفعل`);
        } else {
          console.error(`❌ خطأ في إضافة ${student.name}:`, error.message);
        }
      }
    }
    
    // إحصائيات نهائية
    const [teacherCount] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'teacher'");
    const [parentCount] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'parent'");
    const [studentCount] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
    
    console.log('\n📊 الإحصائيات النهائية:');
    console.log(`👨‍🏫 المعلمين: ${teacherCount[0].count}`);
    console.log(`👪 الأولياء: ${parentCount[0].count}`);
    console.log(`👨‍🎓 التلاميذ: ${studentCount[0].count}`);
    console.log('\n✅ تم إضافة جميع المستخدمين بنجاح!');
    console.log('\n🔑 كلمة المرور لجميع المستخدمين: 123456');
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ عام:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
}

addSampleUsers();

require('dotenv').config();
const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateStudents() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false }
    });
    
    console.log('✅ متصل بقاعدة البيانات\n');
    
    // عرض التلاميذ الحاليين
    const [students] = await connection.query(`
      SELECT id, name, email, student_class, class_number 
      FROM users 
      WHERE role = 'student' 
      ORDER BY id
    `);
    
    console.log('📋 التلاميذ الحاليين:\n');
    students.forEach((s, i) => {
      console.log(`${i + 1}. [ID: ${s.id}] ${s.name} - القسم: ${s.student_class} - الفصل: ${s.class_number || 'غير محدد'}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('سأقوم بتحديث كل تلميذ على حدة');
    console.log('='.repeat(60) + '\n');
    
    for (const student of students) {
      console.log(`\n👤 ${student.name} (${student.email})`);
      console.log(`   القسم الحالي: ${student.student_class}`);
      console.log(`   الفصل الحالي: ${student.class_number || 'غير محدد'}`);
      
      console.log('\nاختر القسم الجديد:');
      console.log('1 - السابعة أساسي');
      console.log('2 - الثامنة أساسي');
      console.log('3 - التاسعة أساسي');
      console.log('0 - تخطي (عدم التغيير)');
      
      const classChoice = await question('القسم: ');
      
      if (classChoice === '0') {
        console.log('⏭️  تم التخطي');
        continue;
      }
      
      let newClass;
      switch(classChoice) {
        case '1': newClass = 'السابعة أساسي'; break;
        case '2': newClass = 'الثامنة أساسي'; break;
        case '3': newClass = 'التاسعة أساسي'; break;
        default:
          console.log('❌ اختيار غير صحيح، تم التخطي');
          continue;
      }
      
      const classNumber = await question('الفصل (رقم من 1-10): ');
      
      if (!classNumber || classNumber < 1 || classNumber > 10) {
        console.log('❌ رقم الفصل غير صحيح، تم التخطي');
        continue;
      }
      
      // تحديث البيانات
      await connection.query(
        'UPDATE users SET student_class = ?, class_number = ? WHERE id = ?',
        [newClass, classNumber, student.id]
      );
      
      console.log(`✅ تم التحديث: ${newClass} - فصل ${classNumber}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ تمت العملية بنجاح!');
    console.log('='.repeat(60));
    
    // عرض البيانات المحدثة
    const [updatedStudents] = await connection.query(`
      SELECT id, name, student_class, class_number 
      FROM users 
      WHERE role = 'student' 
      ORDER BY student_class, class_number, name
    `);
    
    console.log('\n📋 البيانات بعد التحديث:\n');
    console.table(updatedStudents);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (connection) await connection.end();
    rl.close();
  }
}

updateStudents();

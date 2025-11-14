require('dotenv').config();
const { User } = require('../src/models');

async function checkSections() {
  try {
    console.log('🔍 فحص بيانات التلاميذ...\n');
    
    // جلب جميع التلاميذ
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'studentClass', 'section'],
      order: [['studentClass', 'ASC'], ['section', 'ASC'], ['name', 'ASC']],
      limit: 50
    });
    
    console.log(`📊 إجمالي التلاميذ: ${students.length}\n`);
    
    if (students.length === 0) {
      console.log('⚠️ لا يوجد تلاميذ في قاعدة البيانات!');
      return;
    }
    
    // عرض أول 10 تلاميذ
    console.log('📋 عينة من التلاميذ:\n');
    students.slice(0, 10).forEach(student => {
      console.log(`- ${student.name}`);
      console.log(`  القسم: ${student.studentClass || 'غير محدد'}`);
      console.log(`  الفصل: ${student.section || 'غير محدد'}`);
      console.log('');
    });
    
    // إحصائيات حسب القسم
    const classList = {};
    students.forEach(student => {
      const className = student.studentClass || 'غير محدد';
      if (!classList[className]) {
        classList[className] = { total: 0, sections: {} };
      }
      classList[className].total++;
      
      const section = student.section || 'غير محدد';
      if (!classList[className].sections[section]) {
        classList[className].sections[section] = 0;
      }
      classList[className].sections[section]++;
    });
    
    console.log('📊 الإحصائيات التفصيلية:\n');
    Object.keys(classList).forEach(className => {
      console.log(`\n${className}: ${classList[className].total} تلميذ`);
      console.log('  الفصول:');
      Object.keys(classList[className].sections).forEach(section => {
        console.log(`    - فصل ${section}: ${classList[className].sections[section]} تلميذ`);
      });
    });
    
    // التحقق من السابعة أساسي
    console.log('\n\n🔍 تحليل السابعة أساسي:\n');
    const grade7 = students.filter(s => s.studentClass === 'السابعة أساسي');
    console.log(`عدد التلاميذ: ${grade7.length}`);
    
    if (grade7.length > 0) {
      const sections = [...new Set(grade7.map(s => s.section).filter(s => s))];
      console.log(`الفصول المتاحة: ${sections.length > 0 ? sections.join(', ') : 'لا توجد فصول محددة'}`);
      
      console.log('\nتلاميذ السابعة أساسي:');
      grade7.forEach(s => {
        console.log(`  - ${s.name} (فصل: ${s.section || 'غير محدد'})`);
      });
    } else {
      console.log('⚠️ لا يوجد تلاميذ في السابعة أساسي!');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
}

checkSections();

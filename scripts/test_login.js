require('dotenv').config();
const { User } = require('../src/models');
const bcrypt = require('bcryptjs');

async function testLogin() {
  console.log('🔍 اختبار تسجيل الدخول...\n');

  try {
    // البحث عن المسؤول
    const admin = await User.findOne({ 
      where: { email: 'admin@ecole-chebbi.tn' } 
    });

    if (!admin) {
      console.log('❌ حساب المسؤول غير موجود!');
      console.log('📝 جاري إنشاء حساب مسؤول جديد...\n');

      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = await User.create({
        name: 'المسؤول',
        email: 'admin@ecole-chebbi.tn',
        password: hashedPassword,
        role: 'admin'
      });

      console.log('✅ تم إنشاء حساب المسؤول:');
      console.log(`   البريد: ${newAdmin.email}`);
      console.log(`   كلمة المرور: admin123`);
      console.log(`   الدور: ${newAdmin.role}\n`);
    } else {
      console.log('✅ حساب المسؤول موجود:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   الاسم: ${admin.name}`);
      console.log(`   البريد: ${admin.email}`);
      console.log(`   الدور: ${admin.role}\n`);

      // اختبار كلمة المرور
      const isPasswordCorrect = await bcrypt.compare('admin123', admin.password);
      if (isPasswordCorrect) {
        console.log('✅ كلمة المرور صحيحة: admin123');
      } else {
        console.log('❌ كلمة المرور غير صحيحة!');
        console.log('📝 جاري تحديث كلمة المرور إلى: admin123\n');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await admin.update({ password: hashedPassword });
        console.log('✅ تم تحديث كلمة المرور');
      }
    }

    console.log('\n📊 جميع المستخدمين:');
    const users = await User.findAll({ 
      attributes: ['id', 'name', 'email', 'role'],
      limit: 10
    });
    
    users.forEach(user => {
      console.log(`   ${user.id}. ${user.name} (${user.email}) - ${user.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

testLogin();

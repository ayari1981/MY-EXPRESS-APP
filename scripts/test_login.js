require('dotenv').config();
const path = require('path');
const { connectDB } = require(path.join(__dirname, '..', 'src', 'config', 'database'));
const User = require(path.join(__dirname, '..', 'src', 'models', 'User'));

async function testLogin() {
  try {
    await connectDB();
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecole-chebbi.tn';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    console.log(`🔍 محاولة تسجيل الدخول باستخدام:`);
    console.log(`   البريد: ${adminEmail}`);
    console.log(`   كلمة المرور: ${adminPassword}`);
    
    // البحث عن المستخدم
    const admin = await User.findOne({ 
      where: { email: adminEmail.toLowerCase() } 
    });

    
    if (!admin) {
      console.error('❌ المستخدم غير موجود في قاعدة البيانات');
      process.exit(1);
    }
    
    console.log(`✅ تم العثور على المستخدم: ${admin.name} (${admin.role})`);
    
    // اختبار مقارنة كلمة المرور باستخدام دالة comparePassword من النموذج
    const isPasswordCorrect = await admin.comparePassword(adminPassword);
    
    if (isPasswordCorrect) {
      console.log('✅ كلمة المرور صحيحة! تسجيل الدخول سيعمل');
    } else {
      console.error('❌ كلمة المرور غير صحيحة');
      console.log('� جرب تشغيل: node scripts/setAdminPassword.js');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ أثناء اختبار تسجيل الدخول:', error);
    process.exit(1);
  }
}

testLogin();

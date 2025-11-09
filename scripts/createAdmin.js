// سكريبت لإنشاء حساب مدير
// شغّل هذا السكريبت باستخدام: node createAdmin.js

require('dotenv').config();
const { sequelize, connectDB } = require('./src/config/database');
const User = require('./src/models/User');

async function createAdmin() {
  try {
    // الاتصال بقاعدة البيانات
    await connectDB();
    
    // التحقق من وجود مدير
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    
    if (existingAdmin) {
      console.log('⚠️  يوجد حساب مدير بالفعل:', existingAdmin.email);
      process.exit(0);
    }

    // إنشاء حساب مدير جديد
    const adminData = {
      name: 'المدير',
      email: process.env.ADMIN_EMAIL || 'admin@ecole-chebbi.tn',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin',
      isActive: true
    };

    const admin = await User.create(adminData);

    console.log('✅ تم إنشاء حساب المدير بنجاح!');
    console.log('📧 البريد الإلكتروني:', adminData.email);
    console.log('🔑 كلمة المرور:', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('⚠️  تذكر تغيير كلمة المرور بعد تسجيل الدخول!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب المدير:', error);
    process.exit(1);
  }
}

createAdmin();

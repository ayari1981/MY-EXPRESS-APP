// سكريبت لتحديث كلمة مرور المدير إلى القيمة الموجودة في .env
require('dotenv').config();
const path = require('path');
const { connectDB } = require(path.join(__dirname, '..', 'src', 'config', 'database'));
const User = require(path.join(__dirname, '..', 'src', 'models', 'User'));

async function setPassword() {
  try {
    await connectDB();

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecole-chebbi.tn';
    const newPassword = process.env.ADMIN_PASSWORD;

    if (!newPassword) {
      console.error('❌ لا توجد قيمة ADMIN_PASSWORD في ملف .env');
      process.exit(1);
    }

    const admin = await User.findOne({ where: { email: adminEmail } });
    if (!admin) {
      console.error('❌ لم يتم العثور على حساب مدير بالبريد:', adminEmail);
      process.exit(1);
    }

    // تحديث كلمة المرور (سيتم تشفيرها بواسطة hook قبلUpdate)
    admin.password = newPassword;
    await admin.save();

    console.log('✅ تم تحديث كلمة مرور المدير بنجاح إلى القيمة الموجودة في .env');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ أثناء تحديث كلمة مرور المدير:', error);
    process.exit(1);
  }
}

setPassword();
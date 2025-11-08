const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

module.exports = function(passport) {
  // استراتيجية تسجيل الدخول
  passport.use(
    new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
      try {
        // البحث عن المستخدم
        const user = await User.findOne({ 
          where: { email: email.toLowerCase() } 
        });
        
        if (!user) {
          return done(null, false, { message: 'البريد الإلكتروني غير مسجل' });
        }

        // التحقق من كلمة المرور
        const isMatch = await user.comparePassword(password);
        
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'كلمة المرور غير صحيحة' });
        }
      } catch (err) {
        return done(err);
      }
    })
  );

  // حفظ معلومات المستخدم في الجلسة
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // استرجاع معلومات المستخدم من الجلسة
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};

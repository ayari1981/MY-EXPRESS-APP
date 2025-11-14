const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const { ensureGuest, ensureAuthenticated } = require('../middleware/auth');
const { createLog } = require('../middleware/adminLogger');

// صفحة تسجيل الدخول
router.get('/login', ensureGuest, (req, res) => {
  res.render('auth/login', {
    title: 'تسجيل الدخول'
  });
});

// معالجة تسجيل الدخول
router.post('/login', (req, res, next) => {
  const { accessCode } = req.body;
  const ACCESS_CODE = process.env.TEACHER_ACCESS_CODE || '1981';
  
  passport.authenticate('local', async (err, user, info) => {
    if (err) { return next(err); }
    
    if (!user) {
      req.flash('error_msg', info.message);
      return res.redirect('/auth/login');
    }
    
    // التحقق من كود الدخول للمعلمين والإدارة
    if (user.role === 'teacher' || user.role === 'admin') {
      if (!accessCode || accessCode !== ACCESS_CODE) {
        req.flash('error_msg', 'كود الدخول الخاص غير صحيح. المعلمين والإدارة يحتاجون إلى كود صحيح للدخول.');
        return res.redirect('/auth/login');
      }
    }
    
    req.logIn(user, async (err) => {
      if (err) { return next(err); }
      
      // تسجيل عملية تسجيل الدخول
      await createLog(
        user.id,
        'login',
        `${user.name} سجل دخول إلى النظام`,
        {
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          metadata: { role: user.role }
        }
      );
      
      req.flash('success_msg', 'مرحباً بك!');
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

// صفحة التسجيل
router.get('/register', ensureGuest, (req, res) => {
  res.render('auth/register', {
    title: 'إنشاء حساب جديد'
  });
});

// معالجة التسجيل
router.post('/register', async (req, res) => {
  const { name, email, password, password2, role, classLevel, classNumber, subject, childFirstName, childLastName } = req.body;
  
  let errors = [];

  // التحقق من البيانات
  if (!name || !email || !password || !password2 || !role) {
    errors.push({ msg: 'الرجاء ملء جميع الحقول المطلوبة' });
  }

  if (password !== password2) {
    errors.push({ msg: 'كلمات المرور غير متطابقة' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }
  
  // التحقق من بيانات ولي الأمر
  if (role === 'parent' && (!childFirstName || !childLastName)) {
    errors.push({ msg: 'يجب إدخال اسم الابن كاملاً' });
  }

  if (errors.length > 0) {
    return res.render('auth/register', {
      title: 'إنشاء حساب جديد',
      errors,
      name,
      email,
      role
    });
  }

  try {
    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ 
      where: { email: email.toLowerCase() } 
    });
    
    if (existingUser) {
      errors.push({ msg: 'البريد الإلكتروني مسجل مسبقاً' });
      return res.render('auth/register', {
        title: 'إنشاء حساب جديد',
        errors,
        name,
        email,
        role
      });
    }

    // إنشاء بيانات المستخدم الجديد
    const newUserData = {
      name,
      email: email.toLowerCase(),
      password,
      role
    };

    // إضافة البيانات الخاصة بكل دور
    if (role === 'student') {
      newUserData.studentClass = classLevel;
      newUserData.classNumber = classNumber;
    } else if (role === 'teacher') {
      newUserData.teacherSubject = subject;
      newUserData.teacherClasses = [];
    } else if (role === 'parent') {
      newUserData.childFirstName = childFirstName ? childFirstName.trim() : null;
      newUserData.childLastName = childLastName ? childLastName.trim() : null;
    }

    await User.create(newUserData);
    
    req.flash('success_msg', 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول');
    res.redirect('/auth/login');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء إنشاء الحساب');
    res.redirect('/auth/register');
  }
});

// تسجيل الخروج
router.get('/logout', ensureAuthenticated, async (req, res, next) => {
  const userName = req.user.name;
  const userId = req.user.id;
  
  // تسجيل عملية تسجيل الخروج
  await createLog(
    userId,
    'logout',
    `${userName} سجل خروج من النظام`,
    {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    }
  );
  
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'تم تسجيل الخروج بنجاح');
    res.redirect('/');
  });
});

module.exports = router;

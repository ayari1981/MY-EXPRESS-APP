require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const passport = require('passport');
const flash = require('connect-flash');
const path = require('path');
const methodOverride = require('method-override');

const app = express();

// إعداد Passport
require('./config/passport')(passport);

// الاتصال بقاعدة البيانات
const { connectDB, sequelize } = require('./config/database');
connectDB();

// تحميل النماذج مع العلاقات
require('./models');

// محرك العرض EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(methodOverride('_method'));

// إعداد تخزين الجلسات في قاعدة البيانات
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'sessions',
  checkExpirationInterval: 15 * 60 * 1000, // تنظيف الجلسات المنتهية كل 15 دقيقة
  expiration: 24 * 60 * 60 * 1000 // انتهاء الجلسة بعد 24 ساعة
});

// الجلسات
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'ecole-chebbi-secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 24 ساعة
      httpOnly: true,
      sameSite: 'lax'
    }
  })
);

// إنشاء جدول الجلسات تلقائياً
sessionStore.sync();

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// المتغيرات العامة
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// المسارات
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/dashboard', require('./routes/dashboard'));
app.use('/teacher', require('./routes/teacher'));
app.use('/student', require('./routes/student'));
app.use('/parent', require('./routes/parent'));
app.use('/admin', require('./routes/admin'));
app.use('/logs', require('./routes/logs'));

// معالجة الأخطاء 404
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'الصفحة غير موجودة',
    user: req.user
  });
});

// معالج الأخطاء العام
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'خطأ في الخادم',
    user: req.user,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  console.log(`🌐 افتح المتصفح على: http://localhost:${PORT}`);
});

const express = require('express');
const router = express.Router();

// الصفحة الرئيسية
router.get('/', (req, res) => {
  res.render('index', {
    title: 'المدرسة الإعدادية أبو القاسم الشابي',
    user: req.user
  });
});

// صفحة معلومات عنا
router.get('/about', (req, res) => {
  res.render('about', {
    title: 'من نحن',
    user: req.user
  });
});

// صفحة اتصل بنا
router.get('/contact', (req, res) => {
  res.render('contact', {
    title: 'اتصل بنا',
    user: req.user
  });
});

module.exports = router;
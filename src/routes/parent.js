const express = require('express');
const router = express.Router();
const { ensureParent } = require('../middleware/auth');
const { Feedback } = require('../models');

// لوحة تحكم الولي
router.get('/dashboard', ensureParent, async (req, res) => {
  try {
    // جلب الملاحظات المرسلة
    const feedbacks = await Feedback.findAll({ 
      where: { parentId: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    res.render('parent/dashboard', {
      title: 'لوحة تحكم الولي',
      user: req.user,
      feedbacks
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ في تحميل البيانات');
    res.redirect('/');
  }
});

// صفحة إرسال ملاحظة
router.get('/feedback', ensureParent, (req, res) => {
  res.render('parent/feedback', {
    title: 'إرسال ملاحظة',
    user: req.user
  });
});

// معالجة إرسال الملاحظة
router.post('/feedback', ensureParent, async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      req.flash('error_msg', 'الرجاء ملء جميع الحقول');
      return res.redirect('/parent/feedback');
    }
    
    await Feedback.create({
      parentId: req.user.id,
      subject,
      message,
      status: 'pending'
    });
    
    req.flash('success_msg', 'تم إرسال الملاحظة بنجاح. سيتم الرد عليك قريباً');
    res.redirect('/parent/dashboard');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء الإرسال');
    res.redirect('/parent/feedback');
  }
});

module.exports = router;

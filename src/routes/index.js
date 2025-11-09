const express = require('express');
const router = express.Router();
const { Grade, User } = require('../models');
const { Sequelize } = require('sequelize');

// الصفحة الرئيسية
router.get('/', async (req, res) => {
  try {
    // الحصول على أفضل الطلاب في كل مادة
    const topStudentsBySubject = await Grade.findAll({
      attributes: [
        'subject',
        'studentId',
        'studentFirstName',
        'studentLastName',
        [Sequelize.fn('AVG', Sequelize.col('grade_value')), 'avgGrade']
      ],
      where: {
        isPublished: true,
        academicYear: '2024-2025'
      },
      group: ['subject', 'studentId', 'studentFirstName', 'studentLastName'],
      order: [[Sequelize.fn('AVG', Sequelize.col('grade_value')), 'DESC']],
      limit: 50,
      raw: true
    });

    // الحصول على معلومات الطلاب بما في ذلك أسماء الأولياء
    const studentIds = [...new Set(topStudentsBySubject.map(s => s.studentId))];
    const students = await User.findAll({
      where: { id: studentIds },
      attributes: ['id', 'parentId'],
      include: [{
        model: User,
        as: 'parent',
        attributes: ['name'],
        required: false
      }],
      raw: true,
      nest: true
    });

    const studentMap = {};
    students.forEach(s => {
      studentMap[s.id] = s.parent && s.parent.name ? s.parent.name : 'غير محدد';
    });

    // تنظيم البيانات حسب المادة
    const topStudents = {};
    topStudentsBySubject.forEach(record => {
      if (!topStudents[record.subject]) {
        topStudents[record.subject] = [];
      }
      if (topStudents[record.subject].length < 3) {
        topStudents[record.subject].push({
          firstName: record.studentFirstName,
          lastName: record.studentLastName,
          parentName: studentMap[record.studentId] || 'غير محدد',
          avgGrade: parseFloat(record.avgGrade).toFixed(2)
        });
      }
    });

    res.render('index', {
      title: 'المدرسة الإعدادية أبو القاسم الشابي',
      user: req.user,
      topStudents: topStudents
    });
  } catch (error) {
    console.error('خطأ في جلب الطلاب المتميزين:', error);
    res.render('index', {
      title: 'المدرسة الإعدادية أبو القاسم الشابي',
      user: req.user,
      topStudents: {}
    });
  }
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

// معالجة نموذج اتصل بنا
router.post('/contact', (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  
  // هنا يمكن إضافة كود لإرسال البريد الإلكتروني أو حفظ الرسالة في قاعدة البيانات
  console.log('رسالة جديدة من:', { name, email, phone, subject, message });
  
  req.flash('success_msg', 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.');
  res.redirect('/contact');
});

module.exports = router;
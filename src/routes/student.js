const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { ensureStudent } = require('../middleware/auth');
const Lesson = require('../models/Lesson');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { Schedule, Grade } = require('../models');
const { Op } = require('sequelize');

// لوحة تحكم التلميذ
router.get('/dashboard', ensureStudent, async (req, res) => {
  try {
    const studentClass = req.user.studentClass;
    
    // جلب الدروس الحديثة
    const lessons = await Lesson.findAll({ 
      where: {
        class: studentClass,
        isApproved: true 
      },
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit: 10
    });
    
    // إحصائيات
    const totalLessons = await Lesson.count({
      where: {
        class: studentClass,
        isApproved: true
      }
    });
    
    const myComments = await Comment.count({
      where: { userId: req.user.id }
    });
    
    const notifications = await Notification.findAll({
      where: { 
        userId: req.user.id,
        isRead: false
      },
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    res.render('student/dashboard', {
      title: 'لوحة تحكم التلميذ',
      user: req.user,
      lessons,
      stats: {
        totalLessons,
        myComments,
        notifications: notifications.length
      },
      notifications
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ في تحميل البيانات');
    res.redirect('/');
  }
});

// عرض جميع الدروس حسب القسم
router.get('/lessons', ensureStudent, async (req, res) => {
  try {
    const { subject, search } = req.query;
    const studentClass = req.user.studentClass;
    
    let where = { 
      class: studentClass,
      isApproved: true 
    };
    
    if (subject) {
      where.subject = subject;
    }
    
    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    
    const lessons = await Lesson.findAll({
      where,
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });
    
    // جلب المواد الفريدة
    const subjects = await Lesson.findAll({
      where: { class: studentClass, isApproved: true },
      attributes: [[Lesson.sequelize.fn('DISTINCT', Lesson.sequelize.col('subject')), 'subject']],
      raw: true
    });
    
    res.render('student/lessons', {
      title: 'الدروس',
      user: req.user,
      lessons,
      subjects: subjects.map(s => s.subject),
      currentSubject: subject,
      searchQuery: search
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/student/dashboard');
  }
});

// عرض تفاصيل درس
router.get('/lesson/:id', ensureStudent, async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email']
      }]
    });
    
    if (!lesson) {
      req.flash('error_msg', 'الدرس غير موجود');
      return res.redirect('/student/lessons');
    }
    
    // زيادة عدد المشاهدات
    lesson.views += 1;
    await lesson.save();
    
    // جلب التعليقات المعتمدة
    const comments = await Comment.findAll({ 
      where: {
        lessonId: lesson.id,
        isApproved: true 
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.render('student/lesson-detail', {
      title: lesson.title,
      user: req.user,
      lesson,
      comments
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/student/lessons');
  }
});

// تحميل ملف الدرس
router.get('/download/:id', ensureStudent, async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    
    if (!lesson) {
      req.flash('error_msg', 'الدرس غير موجود');
      return res.redirect('/student/lessons');
    }
    
    // زيادة عدد التحميلات
    lesson.downloads += 1;
    await lesson.save();
    
    const filePath = path.join(__dirname, '../../', lesson.fileUrl);
    res.download(filePath, lesson.fileName);
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء التحميل');
    res.redirect('/student/lessons');
  }
});

// إضافة تعليق
router.post('/comment/:lessonId', ensureStudent, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim() === '') {
      req.flash('error_msg', 'الرجاء كتابة التعليق');
      return res.redirect(`/student/lesson/${req.params.lessonId}`);
    }
    
    await Comment.create({
      lessonId: req.params.lessonId,
      userId: req.user.id,
      content: content.trim()
    });
    
    req.flash('success_msg', 'تم إرسال التعليق وفي انتظار الموافقة');
    res.redirect(`/student/lesson/${req.params.lessonId}`);
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect(`/student/lesson/${req.params.lessonId}`);
  }
});

// عرض الإشعارات
router.get('/notifications', ensureStudent, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50
    });
    
    res.render('student/notifications', {
      title: 'الإشعارات',
      user: req.user,
      notifications
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/student/dashboard');
  }
});

// وضع علامة قراءة على الإشعار
router.post('/notifications/:id/read', ensureStudent, async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    
    if (notification && notification.userId === req.user.id) {
      notification.isRead = true;
      await notification.save();
    }
    
    res.redirect('/student/notifications');
  } catch (err) {
    console.error(err);
    res.redirect('/student/notifications');
  }
});

// عرض الملف الشخصي
router.get('/profile', ensureStudent, async (req, res) => {
  try {
    res.render('student/profile', {
      title: 'الملف الشخصي',
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/student/dashboard');
  }
});

// تحديث الملف الشخصي
router.post('/profile', ensureStudent, async (req, res) => {
  try {
    const { name, email, studentClass } = req.body;
    
    // التحقق من البيانات
    if (!name || !email || !studentClass) {
      req.flash('error_msg', 'الرجاء ملء جميع الحقول المطلوبة');
      return res.redirect('/student/profile');
    }
    
    // التحقق من البريد الإلكتروني إذا تم تغييره
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        req.flash('error_msg', 'البريد الإلكتروني مستخدم بالفعل');
        return res.redirect('/student/profile');
      }
    }
    
    // تحديث البيانات
    req.user.name = name;
    req.user.email = email;
    req.user.studentClass = studentClass;
    
    await req.user.save();
    
    req.flash('success_msg', 'تم تحديث الملف الشخصي بنجاح');
    res.redirect('/student/profile');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء التحديث');
    res.redirect('/student/profile');
  }
});

// عرض الجداول
router.get('/schedules', ensureStudent, async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      where: {
        isActive: true,
        scheduleType: 'تلاميذ',
        [Op.or]: [
          { classLevel: req.user.studentClass },
          { classLevel: 'جميع الأقسام' }
        ]
      },
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.render('student/schedules', {
      title: 'الجدول المدرسي وروزنامة الفروض التأليفية',
      user: req.user,
      schedules
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/student/dashboard');
  }
});

// تحميل جدول
router.get('/schedules/download/:id', ensureStudent, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      where: {
        id: req.params.id,
        isActive: true,
        scheduleType: 'تلاميذ',
        [Op.or]: [
          { classLevel: req.user.studentClass },
          { classLevel: 'جميع الأقسام' }
        ]
      }
    });
    
    if (!schedule) {
      req.flash('error_msg', 'الجدول غير موجود أو غير متاح');
      return res.redirect('/student/schedules');
    }
    
    const filePath = path.join(__dirname, '../../', schedule.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      req.flash('error_msg', 'الملف غير موجود');
      return res.redirect('/student/schedules');
    }
    
    // زيادة عداد التحميلات
    schedule.downloads += 1;
    await schedule.save();
    
    res.download(filePath, schedule.fileName);
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/student/schedules');
  }
});

// عرض النتائج
router.get('/grades', ensureStudent, async (req, res) => {
  try {
    const { semester } = req.query;
    
    const whereClause = {
      studentId: req.user.id,
      isPublished: true
    };
    
    if (semester) whereClause.semester = semester;
    
    const grades = await Grade.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name']
      }],
      order: [['semester', 'ASC'], ['subject', 'ASC'], ['created_at', 'DESC']]
    });
    
    // حساب المعدلات
    const gradesBySubject = {};
    const gradesBySemester = {};
    
    grades.forEach(grade => {
      // حسب المادة
      if (!gradesBySubject[grade.subject]) {
        gradesBySubject[grade.subject] = [];
      }
      gradesBySubject[grade.subject].push(grade);
      
      // حسب الفصل
      if (!gradesBySemester[grade.semester]) {
        gradesBySemester[grade.semester] = [];
      }
      gradesBySemester[grade.semester].push(grade);
    });
    
    // حساب المعدل لكل مادة
    const averages = {};
    for (const [subject, subjectGrades] of Object.entries(gradesBySubject)) {
      const total = subjectGrades.reduce((sum, g) => sum + parseFloat(g.gradeValue), 0);
      averages[subject] = (total / subjectGrades.length).toFixed(2);
    }
    
    // حساب المعدل العام
    let generalAverage = 0;
    if (grades.length > 0) {
      const total = grades.reduce((sum, g) => sum + parseFloat(g.gradeValue), 0);
      generalAverage = (total / grades.length).toFixed(2);
    }
    
    res.render('student/grades', {
      title: 'نتائجي',
      user: req.user,
      grades,
      averages,
      generalAverage,
      gradesBySubject,
      gradesBySemester,
      academicYear: '2024-2025',
      selectedSemester: semester || '',
      totalGrades: grades.length,
      subjectAverages: averages,
      overallAverage: parseFloat(generalAverage)
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/student/dashboard');
  }
});

module.exports = router;

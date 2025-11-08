const express = require('express');
const router = express.Router();
const { ensureTeacher } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Lesson, User, Notification, Schedule } = require('../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

// لوحة تحكم المدرس
router.get('/dashboard', ensureTeacher, async (req, res) => {
  try {
    const lessons = await Lesson.findAll({ 
      where: { teacherId: req.user.id },
      order: [['created_at', 'DESC']]
    });
    
    const totalLessons = lessons.length;
    const totalDownloads = lessons.reduce((sum, lesson) => sum + lesson.downloads, 0);
    const totalViews = lessons.reduce((sum, lesson) => sum + lesson.views, 0);
    
    res.render('teacher/dashboard', {
      title: 'لوحة تحكم المدرس',
      user: req.user,
      lessons,
      stats: {
        totalLessons,
        totalDownloads,
        totalViews
      }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ في تحميل البيانات');
    res.redirect('/');
  }
});

// صفحة رفع درس جديد
router.get('/upload', ensureTeacher, (req, res) => {
  res.render('teacher/upload', {
    title: 'رفع درس جديد',
    user: req.user
  });
});

// معالجة رفع الدرس
router.post('/upload', ensureTeacher, upload.single('lessonFile'), async (req, res) => {
  try {
    const { title, description, subject, classLevel, section } = req.body;
    
    if (!req.file) {
      req.flash('error_msg', 'الرجاء اختيار ملف');
      return res.redirect('/teacher/upload');
    }

    const fileExt = path.extname(req.file.originalname).substring(1).toLowerCase();
    
    await Lesson.create({
      title,
      description,
      subject,
      class: classLevel,
      section,
      teacherId: req.user.id,
      fileUrl: '/uploads/lessons/' + req.file.filename,
      fileName: req.file.originalname,
      fileType: fileExt,
      fileSize: req.file.size,
      downloads: 0,
      views: 0,
      isApproved: true
    });
    
    req.flash('success_msg', 'تم رفع الدرس بنجاح!');
    res.redirect('/teacher/dashboard');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء رفع الدرس');
    res.redirect('/teacher/upload');
  }
});

// صفحة تعديل درس
router.get('/edit/:id', ensureTeacher, async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      where: {
        id: req.params.id,
        teacherId: req.user.id
      }
    });
    
    if (!lesson) {
      req.flash('error_msg', 'الدرس غير موجود');
      return res.redirect('/teacher/dashboard');
    }
    
    res.render('teacher/edit', {
      title: 'تعديل الدرس',
      user: req.user,
      lesson
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/dashboard');
  }
});

// معالجة تعديل الدرس
router.post('/edit/:id', ensureTeacher, async (req, res) => {
  try {
    const { title, description, subject, classLevel, section } = req.body;
    
    const lesson = await Lesson.findOne({
      where: {
        id: req.params.id,
        teacherId: req.user.id
      }
    });
    
    if (!lesson) {
      req.flash('error_msg', 'الدرس غير موجود');
      return res.redirect('/teacher/dashboard');
    }
    
    lesson.title = title;
    lesson.description = description;
    lesson.subject = subject;
    lesson.class = classLevel;
    lesson.section = section;
    
    await lesson.save();
    
    req.flash('success_msg', 'تم تحديث الدرس بنجاح');
    res.redirect('/teacher/dashboard');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء التحديث');
    res.redirect('/teacher/dashboard');
  }
});

// حذف درس
router.post('/delete/:id', ensureTeacher, async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      where: {
        id: req.params.id,
        teacherId: req.user.id
      }
    });
    
    if (!lesson) {
      req.flash('error_msg', 'الدرس غير موجود');
      return res.redirect('/teacher/dashboard');
    }
    
    await lesson.destroy();
    
    req.flash('success_msg', 'تم حذف الدرس بنجاح');
    res.redirect('/teacher/dashboard');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء الحذف');
    res.redirect('/teacher/dashboard');
  }
});

// صفحة إرسال إشعار
router.get('/send-notification', ensureTeacher, async (req, res) => {
  try {
    // جلب جميع التلاميذ لإمكانية اختيار تلميذ معين
    const students = await User.findAll({
      where: { role: 'student' },
      attributes: ['id', 'name', 'studentClass'],
      order: [['studentClass', 'ASC'], ['name', 'ASC']]
    });
    
    res.render('teacher/send-notification', {
      title: 'إرسال إشعار',
      user: req.user,
      students: students
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/dashboard');
  }
});

// معالجة إرسال الإشعار
router.post('/send-notification', ensureTeacher, async (req, res) => {
  try {
    const { notificationType, targetClass, specificStudent, title, message } = req.body;
    
    if (!notificationType || !title || !message) {
      req.flash('error_msg', 'الرجاء ملء جميع الحقول المطلوبة');
      return res.redirect('/teacher/send-notification');
    }
    
    let students = [];
    
    // إرسال لتلميذ معين
    if (notificationType === 'specific') {
      if (!specificStudent) {
        req.flash('error_msg', 'الرجاء اختيار التلميذ');
        return res.redirect('/teacher/send-notification');
      }
      
      const student = await User.findOne({
        where: {
          id: specificStudent,
          role: 'student'
        }
      });
      
      if (!student) {
        req.flash('error_msg', 'التلميذ غير موجود');
        return res.redirect('/teacher/send-notification');
      }
      
      students = [student];
    } 
    // إرسال لقسم كامل
    else if (notificationType === 'class') {
      if (!targetClass) {
        req.flash('error_msg', 'الرجاء اختيار القسم');
        return res.redirect('/teacher/send-notification');
      }
      
      students = await User.findAll({
        where: {
          role: 'student',
          studentClass: targetClass
        }
      });
      
      if (students.length === 0) {
        req.flash('error_msg', 'لا يوجد تلاميذ في هذا القسم');
        return res.redirect('/teacher/send-notification');
      }
    }
    
    // إنشاء إشعار لكل تلميذ
    const notifications = students.map(student => ({
      userId: student.id,
      title: title,
      message: message,
      isRead: false
    }));
    
    await Notification.bulkCreate(notifications);
    
    if (notificationType === 'specific') {
      req.flash('success_msg', `تم إرسال الإشعار بنجاح إلى ${students[0].name}`);
    } else {
      req.flash('success_msg', `تم إرسال الإشعار بنجاح إلى ${students.length} تلميذ في ${targetClass}`);
    }
    
    res.redirect('/teacher/dashboard');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء إرسال الإشعار');
    res.redirect('/teacher/send-notification');
  }
});

// عرض الجداول
router.get('/schedules', ensureTeacher, async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      where: {
        isActive: true,
        scheduleType: 'أساتذة'
      },
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.render('teacher/schedules', {
      title: 'الجداول',
      user: req.user,
      schedules
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/dashboard');
  }
});

// تحميل جدول
router.get('/schedules/download/:id', ensureTeacher, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({
      where: {
        id: req.params.id,
        isActive: true,
        scheduleType: 'أساتذة'
      }
    });
    
    if (!schedule) {
      req.flash('error_msg', 'الجدول غير موجود أو غير متاح');
      return res.redirect('/teacher/schedules');
    }
    
    const filePath = path.join(__dirname, '../../', schedule.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      req.flash('error_msg', 'الملف غير موجود');
      return res.redirect('/teacher/schedules');
    }
    
    // زيادة عداد التحميلات
    schedule.downloads += 1;
    await schedule.save();
    
    res.download(filePath, schedule.fileName);
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/schedules');
  }
});

module.exports = router;

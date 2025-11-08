const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth');
const { User, Lesson, Comment, Feedback, Schedule } = require('../models');
const { Op } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إعداد multer للجداول
const scheduleStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/schedules';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'schedule-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const scheduleUpload = multer({
  storage: scheduleStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|docx|doc|xlsx|xls|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مسموح! (PDF, DOCX, XLSX, JPG, PNG فقط)'));
    }
  }
});

// لوحة تحكم المدير
router.get('/dashboard', ensureAdmin, async (req, res) => {
  try {
    // إحصائيات
    const totalUsers = await User.count();
    const totalTeachers = await User.count({ where: { role: 'teacher' } });
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalParents = await User.count({ where: { role: 'parent' } });
    const totalLessons = await Lesson.count();
    const pendingComments = await Comment.count({ where: { isApproved: false } });
    const pendingFeedbacks = await Feedback.count({ where: { status: 'pending' } });
    
    // آخر الأنشطة
    const recentLessons = await Lesson.findAll({
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    const recentUsers = await User.findAll({
      order: [['created_at', 'DESC']],
      limit: 5
    });
    
    res.render('admin/dashboard', {
      title: 'لوحة تحكم الإدارة',
      user: req.user,
      stats: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalParents,
        totalLessons,
        pendingComments,
        pendingFeedbacks
      },
      recentLessons,
      recentUsers
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ في تحميل البيانات');
    res.redirect('/');
  }
});

// إدارة المستخدمين
router.get('/users', ensureAdmin, async (req, res) => {
  try {
    const { role, search } = req.query;
    
    let where = {};
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const users = await User.findAll({ 
      where,
      order: [['created_at', 'DESC']]
    });
    
    res.render('admin/users', {
      title: 'إدارة المستخدمين',
      user: req.user,
      users,
      currentRole: role,
      searchQuery: search
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/admin/dashboard');
  }
});

// حذف مستخدم
router.post('/users/delete/:id', ensureAdmin, async (req, res) => {
  try {
    await User.destroy({ where: { id: req.params.id } });
    req.flash('success_msg', 'تم حذف المستخدم بنجاح');
    res.redirect('/admin/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/admin/users');
  }
});

// إدارة التعليقات
router.get('/comments', ensureAdmin, async (req, res) => {
  try {
    const comments = await Comment.findAll({ 
      where: { isApproved: false },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        },
        {
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'title']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.render('admin/comments', {
      title: 'إدارة التعليقات',
      user: req.user,
      comments
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/admin/dashboard');
  }
});

// الموافقة على تعليق
router.post('/comments/approve/:id', ensureAdmin, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (comment) {
      comment.isApproved = true;
      await comment.save();
      req.flash('success_msg', 'تمت الموافقة على التعليق');
    }
    res.redirect('/admin/comments');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/admin/comments');
  }
});

// حذف تعليق
router.post('/comments/delete/:id', ensureAdmin, async (req, res) => {
  try {
    await Comment.destroy({ where: { id: req.params.id } });
    req.flash('success_msg', 'تم حذف التعليق');
    res.redirect('/admin/comments');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/admin/comments');
  }
});

// إدارة الملاحظات
router.get('/feedbacks', ensureAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      include: [{
        model: User,
        as: 'parent',
        attributes: ['id', 'name', 'email']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.render('admin/feedbacks', {
      title: 'ملاحظات الأولياء',
      user: req.user,
      feedbacks
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/admin/dashboard');
  }
});

// الرد على ملاحظة
router.post('/feedbacks/respond/:id', ensureAdmin, async (req, res) => {
  try {
    const { response } = req.body;
    
    const feedback = await Feedback.findByPk(req.params.id);
    if (feedback) {
      feedback.adminResponse = response;
      feedback.status = 'responded';
      feedback.respondedAt = new Date();
      await feedback.save();
      req.flash('success_msg', 'تم الرد على الملاحظة');
    }
    res.redirect('/admin/feedbacks');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/admin/feedbacks');
  }
});

// ============ إدارة الجداول ============

// عرض جميع الجداول
router.get('/schedules', ensureAdmin, async (req, res) => {
  try {
    const schedules = await Schedule.findAll({
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id', 'name']
      }],
      order: [['created_at', 'DESC']]
    });
    
    res.render('admin/schedules', {
      title: 'إدارة الجداول',
      user: req.user,
      schedules
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/admin/dashboard');
  }
});

// صفحة رفع جدول جديد
router.get('/schedules/upload', ensureAdmin, (req, res) => {
  res.render('admin/schedule-upload', {
    title: 'رفع جدول جديد',
    user: req.user
  });
});

// رفع جدول جديد
router.post('/schedules/upload', ensureAdmin, scheduleUpload.single('scheduleFile'), async (req, res) => {
  try {
    if (!req.file) {
      req.flash('error_msg', 'الرجاء اختيار ملف');
      return res.redirect('/admin/schedules/upload');
    }
    
    const { title, description, classLevel, scheduleType } = req.body;
    
    if (!title || !classLevel || !scheduleType) {
      // حذف الملف المرفوع
      fs.unlinkSync(req.file.path);
      req.flash('error_msg', 'الرجاء ملء جميع الحقول المطلوبة');
      return res.redirect('/admin/schedules/upload');
    }
    
    const fileExtension = path.extname(req.file.originalname).substring(1).toLowerCase();
    
    await Schedule.create({
      title,
      description,
      classLevel,
      scheduleType,
      fileUrl: '/uploads/schedules/' + req.file.filename,
      fileName: req.file.originalname,
      fileType: fileExtension,
      fileSize: req.file.size,
      uploadedBy: req.user.id
    });
    
    req.flash('success_msg', 'تم رفع الجدول بنجاح');
    res.redirect('/admin/schedules');
    
  } catch (err) {
    console.error(err);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    req.flash('error_msg', 'حدث خطأ أثناء رفع الجدول');
    res.redirect('/admin/schedules/upload');
  }
});

// صفحة تعديل جدول
router.get('/schedules/edit/:id', ensureAdmin, async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    
    if (!schedule) {
      req.flash('error_msg', 'الجدول غير موجود');
      return res.redirect('/admin/schedules');
    }
    
    res.render('admin/schedule-edit', {
      title: 'تعديل جدول',
      user: req.user,
      schedule
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/admin/schedules');
  }
});

// تحديث جدول
router.post('/schedules/edit/:id', ensureAdmin, scheduleUpload.single('scheduleFile'), async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    
    if (!schedule) {
      req.flash('error_msg', 'الجدول غير موجود');
      return res.redirect('/admin/schedules');
    }
    
    const { title, description, classLevel, scheduleType, isActive } = req.body;
    
    // تحديث البيانات الأساسية
    schedule.title = title || schedule.title;
    schedule.description = description || schedule.description;
    schedule.classLevel = classLevel || schedule.classLevel;
    schedule.scheduleType = scheduleType || schedule.scheduleType;
    schedule.isActive = isActive === 'true';
    
    // إذا تم رفع ملف جديد
    if (req.file) {
      // حذف الملف القديم
      const oldFilePath = path.join(__dirname, '../../', schedule.fileUrl);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
      
      const fileExtension = path.extname(req.file.originalname).substring(1).toLowerCase();
      
      schedule.fileUrl = '/uploads/schedules/' + req.file.filename;
      schedule.fileName = req.file.originalname;
      schedule.fileType = fileExtension;
      schedule.fileSize = req.file.size;
    }
    
    await schedule.save();
    
    req.flash('success_msg', 'تم تحديث الجدول بنجاح');
    res.redirect('/admin/schedules');
    
  } catch (err) {
    console.error(err);
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    req.flash('error_msg', 'حدث خطأ أثناء التحديث');
    res.redirect('/admin/schedules');
  }
});

// حذف جدول
router.post('/schedules/delete/:id', ensureAdmin, async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    
    if (!schedule) {
      req.flash('error_msg', 'الجدول غير موجود');
      return res.redirect('/admin/schedules');
    }
    
    // حذف الملف من السيرفر
    const filePath = path.join(__dirname, '../../', schedule.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    await schedule.destroy();
    
    req.flash('success_msg', 'تم حذف الجدول بنجاح');
    res.redirect('/admin/schedules');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء الحذف');
    res.redirect('/admin/schedules');
  }
});

// تحميل جدول (للإحصائيات)
router.get('/schedules/download/:id', ensureAdmin, async (req, res) => {
  try {
    const schedule = await Schedule.findByPk(req.params.id);
    
    if (!schedule) {
      return res.status(404).send('الجدول غير موجود');
    }
    
    const filePath = path.join(__dirname, '../../', schedule.fileUrl);
    
    if (!fs.existsSync(filePath)) {
      req.flash('error_msg', 'الملف غير موجود');
      return res.redirect('/admin/schedules');
    }
    
    // زيادة عداد التحميلات
    schedule.downloads += 1;
    await schedule.save();
    
    res.download(filePath, schedule.fileName);
    
  } catch (err) {
    console.error(err);
    res.status(500).send('حدث خطأ');
  }
});

module.exports = router;

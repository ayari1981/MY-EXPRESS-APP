const express = require('express');
const router = express.Router();
const { ensureTeacher } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { Lesson, User, Notification, Schedule, Grade, StudentRecord } = require('../models');
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
      studentClass: classLevel,
      classNumber: section,
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
    lesson.studentClass = classLevel;
    lesson.classNumber = section;
    
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
    res.render('teacher/send-notification', {
      title: 'إرسال إشعار',
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/dashboard');
  }
});

// API: الحصول على الصفوف حسب القسم
router.get('/api/sections-by-class/:classLevel', ensureTeacher, async (req, res) => {
  try {
    const { classLevel } = req.params;
    
    const sections = await User.findAll({
      where: { 
        role: 'student',
        studentClass: classLevel
      },
      attributes: ['classNumber'],
      group: ['classNumber'],
      order: [['classNumber', 'ASC']]
    });
    
    const sectionList = sections
      .map(s => s.classNumber)
      .filter(s => s && s.trim() !== '');
    
    res.json({ sections: sectionList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// API: الحصول على التلاميذ حسب القسم والصف
router.get('/api/students-by-section/:classLevel/:section', ensureTeacher, async (req, res) => {
  try {
    const { classLevel, section } = req.params;
    
    const students = await User.findAll({
      where: { 
        role: 'student',
        studentClass: classLevel,
        classNumber: section
      },
      attributes: ['id', 'name', 'studentClass', 'classNumber'],
      order: [['name', 'ASC']]
    });
    
    res.json({ students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// معالجة إرسال الإشعار
router.post('/send-notification', ensureTeacher, async (req, res) => {
  try {
    const { notificationType, targetClass, targetSection, specificStudent, title, message } = req.body;
    
    if (!notificationType || !title || !message) {
      req.flash('error_msg', 'الرجاء ملء جميع الحقول المطلوبة');
      return res.redirect('/teacher/send-notification');
    }
    
    let students = [];
    let successMessage = '';
    
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
      successMessage = `تم إرسال الإشعار بنجاح إلى ${student.name}`;
    } 
    // إرسال لصف معين من قسم
    else if (notificationType === 'section') {
      if (!targetClass || !targetSection) {
        req.flash('error_msg', 'الرجاء اختيار القسم والصف');
        return res.redirect('/teacher/send-notification');
      }
      
      students = await User.findAll({
        where: {
          role: 'student',
          studentClass: targetClass,
          classNumber: targetSection
        }
      });
      
      if (students.length === 0) {
        req.flash('error_msg', 'لا يوجد تلاميذ في هذا الصف');
        return res.redirect('/teacher/send-notification');
      }
      
      successMessage = `تم إرسال الإشعار بنجاح إلى ${students.length} تلميذ في ${targetClass} - صف ${targetSection}`;
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
      
      successMessage = `تم إرسال الإشعار بنجاح إلى ${students.length} تلميذ في ${targetClass}`;
    }
    
    // إنشاء إشعار لكل تلميذ
    const notifications = students.map(student => ({
      userId: student.id,
      type: 'announcement',
      title: title,
      message: message,
      isRead: false
    }));
    
    await Notification.bulkCreate(notifications);
    
    req.flash('success_msg', successMessage);
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

// ============ إدارة النتائج والأعداد ============

// صفحة إدارة النتائج
router.get('/grades', ensureTeacher, async (req, res) => {
  try {
    const { classLevel, classNumber, semester } = req.query;
    
    const whereClause = {
      teacherId: req.user.id
    };
    
    if (classLevel) whereClause.studentClass = classLevel;
    if (classNumber) whereClause.classNumber = classNumber;
    if (semester) whereClause.semester = semester;
    
    const grades = await Grade.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'email']
      }],
      order: [['studentClass', 'ASC'], ['classNumber', 'ASC'], ['studentLastName', 'ASC'], ['created_at', 'DESC']]
    });
    
    // إحصائيات
    const stats = {
      totalGrades: await Grade.count({ where: { teacherId: req.user.id } }),
      publishedGrades: await Grade.count({ where: { teacherId: req.user.id, isPublished: true } }),
      unpublishedGrades: await Grade.count({ where: { teacherId: req.user.id, isPublished: false } })
    };
    
    res.render('teacher/grades', {
      title: 'إدارة النتائج',
      user: req.user,
      grades,
      stats,
      filters: { classLevel, classNumber, semester }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/dashboard');
  }
});

// صفحة إضافة نتائج
router.get('/grades/add', ensureTeacher, async (req, res) => {
  try {
    res.render('teacher/grades-add', {
      title: 'إضافة نتائج',
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/grades');
  }
});

// البحث عن التلاميذ حسب القسم
router.get('/grades/students', ensureTeacher, async (req, res) => {
  try {
    const classLevel = req.query.class || req.query.classLevel;
    const classNumber = req.query.classNumber;
    
    if (!classLevel) {
      return res.json([]);
    }
    
    const whereClause = {
      role: 'student',
      studentClass: classLevel
    };
    
    // إضافة رقم الصف إذا تم تحديده
    if (classNumber) {
      whereClause.classNumber = classNumber;
    }
    
    const students = await User.findAll({
      where: whereClause,
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']]
    });
    
    // تقسيم الاسم إلى firstName و lastName
    const studentsData = students.map(student => {
      const nameParts = student.name.split(' ');
      return {
        id: student.id,
        firstName: nameParts[0] || student.name,
        lastName: nameParts.slice(1).join(' ') || '',
        email: student.email
      };
    });
    
    res.json(studentsData);
  } catch (err) {
    console.error('Error loading students:', err);
    res.status(500).json({ error: 'حدث خطأ' });
  }
});

// إضافة نتائج لقسم كامل
router.post('/grades/add-bulk', ensureTeacher, async (req, res) => {
  try {
    const { studentClass, classNumber, subject, gradeType, semester, examDate, students, academicYear } = req.body;
    
    if (!studentClass || !subject || !gradeType || !semester || !students) {
      req.flash('error_msg', 'الرجاء ملء جميع الحقول المطلوبة');
      return res.redirect('/teacher/grades/add');
    }
    
    // الحصول على اسم المعلم
    const teacherNames = req.user.name.split(' ');
    const teacherFirstName = teacherNames[0] || req.user.name;
    const teacherLastName = teacherNames.slice(1).join(' ') || '';
    
    const gradeRecords = [];
    
    // معالجة النتائج
    for (const key in students) {
      const studentData = students[key];
      
      if (studentData.gradeValue && studentData.gradeValue.trim() !== '') {
        gradeRecords.push({
          studentId: studentData.studentId,
          studentFirstName: studentData.studentFirstName,
          studentLastName: studentData.studentLastName,
          studentClass: studentClass,
          classNumber: classNumber || null,
          teacherId: req.user.id,
          teacherFirstName,
          teacherLastName,
          subject,
          gradeType,
          gradeValue: parseFloat(studentData.gradeValue),
          maxGrade: gradeType === 'شفاهي' ? 10 : 20,
          semester,
          academicYear: academicYear || '2024-2025',
          examDate: examDate || null,
          remarks: studentData.remarks || null,
          isPublished: false
        });
      }
    }
    
    if (gradeRecords.length === 0) {
      req.flash('error_msg', 'لم يتم إضافة أي نتائج');
      return res.redirect('/teacher/grades/add');
    }
    
    await Grade.bulkCreate(gradeRecords);
    
    req.flash('success_msg', `تم إضافة ${gradeRecords.length} نتيجة بنجاح`);
    res.redirect('/teacher/grades');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء إضافة النتائج');
    res.redirect('/teacher/grades/add');
  }
});

// تعديل نتيجة
router.post('/grades/edit/:id', ensureTeacher, async (req, res) => {
  try {
    const { gradeValue, remarks } = req.body;
    
    const grade = await Grade.findOne({
      where: {
        id: req.params.id,
        teacherId: req.user.id
      }
    });
    
    if (!grade) {
      req.flash('error_msg', 'النتيجة غير موجودة');
      return res.redirect('/teacher/grades');
    }
    
    grade.gradeValue = parseFloat(gradeValue);
    grade.remarks = remarks || null;
    await grade.save();
    
    req.flash('success_msg', 'تم تحديث النتيجة بنجاح');
    res.redirect('/teacher/grades');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء التحديث');
    res.redirect('/teacher/grades');
  }
});

// نشر/إلغاء نشر نتيجة
router.post('/grades/publish/:id', ensureTeacher, async (req, res) => {
  try {
    const grade = await Grade.findOne({
      where: {
        id: req.params.id,
        teacherId: req.user.id
      }
    });
    
    if (!grade) {
      req.flash('error_msg', 'النتيجة غير موجودة');
      return res.redirect('/teacher/grades');
    }
    
    grade.isPublished = !grade.isPublished;
    await grade.save();
    
    req.flash('success_msg', grade.isPublished ? 'تم نشر النتيجة' : 'تم إلغاء نشر النتيجة');
    res.redirect('/teacher/grades');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/grades');
  }
});

// نشر جميع نتائج قسم معين
router.post('/grades/publish-all', ensureTeacher, async (req, res) => {
  try {
    const { classLevel, subject, gradeType, semester } = req.body;
    
    const whereClause = {
      teacherId: req.user.id,
      isPublished: false
    };
    
    if (classLevel) whereClause.studentClass = classLevel;
    if (subject) whereClause.subject = subject;
    if (gradeType) whereClause.gradeType = gradeType;
    if (semester) whereClause.semester = semester;
    
    const result = await Grade.update(
      { isPublished: true },
      { where: whereClause }
    );
    
    req.flash('success_msg', `تم نشر ${result[0]} نتيجة`);
    res.redirect('/teacher/grades');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/grades');
  }
});

// حذف نتيجة
router.post('/grades/delete/:id', ensureTeacher, async (req, res) => {
  try {
    const grade = await Grade.findOne({
      where: {
        id: req.params.id,
        teacherId: req.user.id
      }
    });
    
    if (!grade) {
      req.flash('error_msg', 'النتيجة غير موجودة');
      return res.redirect('/teacher/grades');
    }
    
    await grade.destroy();
    
    req.flash('success_msg', 'تم حذف النتيجة بنجاح');
    res.redirect('/teacher/grades');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء الحذف');
    res.redirect('/teacher/grades');
  }
});

// ============ إدارة سجلات الطلاب (الغيابات والعقوبات) ============

// صفحة عرض السجلات
router.get('/records', ensureTeacher, async (req, res) => {
  try {
    const { classLevel, classNumber, recordType, startDate, endDate } = req.query;
    
    const whereClause = {
      recordedBy: req.user.id
    };
    
    if (recordType) whereClause.recordType = recordType;
    if (startDate) whereClause.date = { ...whereClause.date, [Op.gte]: startDate };
    if (endDate) whereClause.date = { ...whereClause.date, [Op.lte]: endDate };
    
    let records = await StudentRecord.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'studentClass', 'classNumber']
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    
    // تصفية حسب القسم ورقم الصف
    if (classLevel) {
      records = records.filter(record => record.student && record.student.studentClass === classLevel);
    }
    if (classNumber) {
      records = records.filter(record => record.student && record.student.classNumber === parseInt(classNumber));
    }
    
    // إحصائيات
    const stats = {
      totalRecords: await StudentRecord.count({ where: { recordedBy: req.user.id } }),
      absences: await StudentRecord.count({ where: { recordedBy: req.user.id, recordType: 'absence' } }),
      punishments: await StudentRecord.count({ where: { recordedBy: req.user.id, recordType: 'punishment' } }),
      notes: await StudentRecord.count({ where: { recordedBy: req.user.id, recordType: 'note' } })
    };
    
    res.render('teacher/records', {
      title: 'سجلات الطلاب',
      user: req.user,
      records,
      stats,
      filters: { classLevel, classNumber, recordType, startDate, endDate }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/dashboard');
  }
});

// صفحة إضافة سجل جديد
router.get('/records/add', ensureTeacher, async (req, res) => {
  try {
    res.render('teacher/records-add', {
      title: 'إضافة سجل طالب',
      user: req.user
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/records');
  }
});

// إضافة سجل جديد
router.post('/records/add', ensureTeacher, async (req, res) => {
  try {
    const { 
      studentId, 
      recordType, 
      date, 
      absenceType, 
      punishmentType, 
      punishmentSeverity,
      description, 
      notes 
    } = req.body;
    
    if (!studentId || !recordType || !date) {
      req.flash('error_msg', 'الرجاء ملء جميع الحقول المطلوبة');
      return res.redirect('/teacher/records/add');
    }
    
    // التحقق من وجود الطالب
    const student = await User.findOne({
      where: { id: studentId, role: 'student' }
    });
    
    if (!student) {
      req.flash('error_msg', 'الطالب غير موجود');
      return res.redirect('/teacher/records/add');
    }
    
    // تحضير البيانات مع التحقق من القيم
    const studentName = student.name || '';
    const nameparts = studentName.trim().split(' ').filter(part => part.length > 0);
    const studentFirstName = nameparts[0] || 'غير محدد';
    const studentLastName = nameparts.slice(1).join(' ') || 'غير محدد';
    const studentClass = student.studentClass || 'غير محدد';
    
    console.log('🔍 بيانات الطالب:', {
      id: student.id,
      name: student.name,
      studentClass: student.studentClass,
      parsedFirstName: studentFirstName,
      parsedLastName: studentLastName
    });
    
    // إنشاء السجل
    const record = await StudentRecord.create({
      studentId,
      recordType,
      date,
      absenceType: recordType === 'absence' ? absenceType : null,
      punishmentType: recordType === 'punishment' ? punishmentType : null,
      punishmentSeverity: recordType === 'punishment' ? punishmentSeverity : null,
      description,
      notes,
      recordedBy: req.user.id,
      // المعلومات المطلوبة مع قيم افتراضية آمنة
      studentFirstName: studentFirstName,
      studentLastName: studentLastName,
      studentClass: studentClass,
      recordedByName: req.user.name || 'غير محدد',
      recordedByRole: req.user.role || 'teacher',
      parentNotified: true,
      notifiedAt: new Date()
    });
    
    // إرسال إشعار للولي إذا كان مرتبطاً
    const parent = await User.findOne({
      where: {
        role: 'parent',
        childFirstName: student.name.split(' ')[0],
        childLastName: student.name.split(' ').slice(1).join(' ')
      }
    });
    
    if (parent) {
      const notificationTitle = recordType === 'absence' ? 'غياب' : recordType === 'punishment' ? 'عقوبة' : 'ملاحظة';
      await Notification.create({
        userId: parent.id,
        title: `${notificationTitle} - ${student.name}`,
        message: description || 'تم تسجيل سجل جديد لابنك',
        isRead: false
      });
    }
    
    const recordTypeAr = recordType === 'absence' ? 'الغياب' : recordType === 'punishment' ? 'العقوبة' : 'الملاحظة';
    req.flash('success_msg', `تم تسجيل ${recordTypeAr} بنجاح`);
    res.redirect('/teacher/records');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء الحفظ');
    res.redirect('/teacher/records/add');
  }
});

// تعديل سجل
router.post('/records/edit/:id', ensureTeacher, async (req, res) => {
  try {
    const { description, notes } = req.body;
    
    const record = await StudentRecord.findOne({
      where: {
        id: req.params.id,
        recordedBy: req.user.id
      }
    });
    
    if (!record) {
      req.flash('error_msg', 'السجل غير موجود');
      return res.redirect('/teacher/records');
    }
    
    record.description = description || null;
    record.notes = notes || null;
    await record.save();
    
    req.flash('success_msg', 'تم تحديث السجل بنجاح');
    res.redirect('/teacher/records');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء التحديث');
    res.redirect('/teacher/records');
  }
});

// حذف سجل
router.post('/records/delete/:id', ensureTeacher, async (req, res) => {
  try {
    const record = await StudentRecord.findOne({
      where: {
        id: req.params.id,
        recordedBy: req.user.id
      }
    });
    
    if (!record) {
      req.flash('error_msg', 'السجل غير موجود');
      return res.redirect('/teacher/records');
    }
    
    await record.destroy();
    
    req.flash('success_msg', 'تم حذف السجل بنجاح');
    res.redirect('/teacher/records');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء الحذف');
    res.redirect('/teacher/records');
  }
});

// طباعة احترافية للنتائج
router.get('/grades/print', ensureTeacher, async (req, res) => {
  try {
    const { classLevel, classNumber, subject, semester } = req.query;
    
    if (!classLevel) {
      req.flash('error_msg', 'يجب اختيار القسم للطباعة');
      return res.redirect('/teacher/grades');
    }
    
    const whereClause = { 
      studentClass: classLevel,
      teacherId: req.user.id  // فقط الدرجات التي يدرسها هذا المدرس
    };
    if (classNumber) whereClause.classNumber = classNumber;
    if (subject) whereClause.subject = subject;
    if (semester) whereClause.semester = semester;
    
    const grades = await Grade.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'name']
        }
      ],
      order: [['subject', 'ASC'], ['studentLastName', 'ASC'], ['studentFirstName', 'ASC']]
    });
    
    res.render('teacher/grades-print', {
      title: 'طباعة النتائج',
      grades,
      filters: { classLevel, classNumber, subject, semester },
      teacher: req.user.name,
      printDate: new Date().toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
      })
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/teacher/grades');
  }
});

module.exports = router;

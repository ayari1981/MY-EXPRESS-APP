const express = require('express');
const router = express.Router();
const { ensureParent } = require('../middleware/auth');
const { Feedback, Grade, User, StudentRecord, Notification } = require('../models');
const { Op } = require('sequelize');

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

// عرض نتائج الابن
router.get('/grades', ensureParent, async (req, res) => {
  try {
    const { semester, searchFirstName, searchLastName } = req.query;
    
    // تحديد إذا كان الولي مربوط بابن أو يبحث مؤقتاً
    let childFirstName = req.user.childFirstName;
    let childLastName = req.user.childLastName;
    let hasChild = !!(childFirstName && childLastName);
    
    // إذا كان الولي يبحث عن ابن غير مربوط
    if (!hasChild && searchFirstName && searchLastName) {
      childFirstName = searchFirstName.trim();
      childLastName = searchLastName.trim();
    }
    
    // إذا لم يكن هناك معلومات عن الابن
    if (!childFirstName || !childLastName) {
      return res.render('parent/grades', {
        title: 'نتائج الابن',
        user: req.user,
        hasChild: false,
        grades: [],
        academicYear: '2024-2025',
        selectedSemester: '',
        totalGrades: 0,
        subjectAverages: {},
        overallAverage: 0,
        generalAverage: 0,
        gradesBySubject: {},
        gradesBySemester: {},
        childName: null,
        searchFirstName: searchFirstName || '',
        searchLastName: searchLastName || '',
        filters: { semester }
      });
    }
    
    const whereClause = {
      studentFirstName: childFirstName,
      studentLastName: childLastName,
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
    
    // إذا لم توجد نتائج للبحث
    if (grades.length === 0 && !hasChild) {
      req.flash('error_msg', `لم يتم العثور على نتائج للتلميذ: ${childFirstName} ${childLastName}`);
    }
    
    // حساب المعدلات
    const gradesBySubject = {};
    const gradesBySemester = {};
    
    grades.forEach(grade => {
      if (!gradesBySubject[grade.subject]) {
        gradesBySubject[grade.subject] = [];
      }
      gradesBySubject[grade.subject].push(grade);
      
      if (!gradesBySemester[grade.semester]) {
        gradesBySemester[grade.semester] = [];
      }
      gradesBySemester[grade.semester].push(grade);
    });
    
    const averages = {};
    for (const [subject, subjectGrades] of Object.entries(gradesBySubject)) {
      const total = subjectGrades.reduce((sum, g) => sum + parseFloat(g.gradeValue), 0);
      averages[subject] = (total / subjectGrades.length).toFixed(2);
    }
    
    let generalAverage = 0;
    if (grades.length > 0) {
      const total = grades.reduce((sum, g) => sum + parseFloat(g.gradeValue), 0);
      generalAverage = (total / grades.length).toFixed(2);
    }
    
    res.render('parent/grades', {
      title: 'نتائج الابن',
      user: req.user,
      hasChild,
      grades,
      academicYear: '2024-2025',
      selectedSemester: semester || '',
      totalGrades: grades.length,
      subjectAverages: averages,
      overallAverage: parseFloat(generalAverage),
      generalAverage,
      gradesBySubject,
      gradesBySemester,
      childName: `${childFirstName} ${childLastName}`,
      searchFirstName: searchFirstName || '',
      searchLastName: searchLastName || '',
      filters: { semester }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/parent/dashboard');
  }
});

// عرض سجلات الابن (الغيابات والعقوبات)
router.get('/notifications', ensureParent, async (req, res) => {
  try {
    const { recordType, isRead, startDate, endDate } = req.query;
    
    // تحديد معلومات الابن
    const childFirstName = req.user.childFirstName;
    const childLastName = req.user.childLastName;
    
    // إذا لم يكن الولي مربوط بابن
    if (!childFirstName || !childLastName) {
      return res.render('parent/notifications', {
        title: 'إشعارات الابن',
        user: req.user,
        records: [],
        hasChild: false,
        stats: {
          totalRecords: 0,
          unreadRecords: 0,
          absences: 0,
          punishments: 0
        },
        filters: {}
      });
    }
    
    // البحث عن الابن
    const student = await User.findOne({
      where: {
        role: 'student',
        name: {
          [Op.like]: `${childFirstName}%${childLastName}%`
        }
      }
    });
    
    if (!student) {
      req.flash('error_msg', 'لم يتم العثور على الابن في النظام');
      return res.render('parent/notifications', {
        title: 'إشعارات الابن',
        user: req.user,
        records: [],
        hasChild: true,
        childName: `${childFirstName} ${childLastName}`,
        stats: {
          totalRecords: 0,
          unreadRecords: 0,
          absences: 0,
          punishments: 0
        },
        filters: {}
      });
    }
    
    // إعداد شروط البحث
    const whereClause = {
      studentId: student.id
    };
    
    if (recordType) whereClause.recordType = recordType;
    if (isRead !== undefined) whereClause.isRead = isRead === 'true';
    if (startDate) whereClause.date = { ...whereClause.date, [Op.gte]: startDate };
    if (endDate) whereClause.date = { ...whereClause.date, [Op.lte]: endDate };
    
    // جلب السجلات
    const records = await StudentRecord.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'recorder',
        attributes: ['id', 'name', 'role']
      }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });
    
    // إحصائيات
    const stats = {
      totalRecords: await StudentRecord.count({ where: { studentId: student.id } }),
      unreadRecords: await StudentRecord.count({ where: { studentId: student.id, isRead: false } }),
      absences: await StudentRecord.count({ where: { studentId: student.id, recordType: 'absence' } }),
      punishments: await StudentRecord.count({ where: { studentId: student.id, recordType: 'punishment' } })
    };
    
    res.render('parent/notifications', {
      title: 'إشعارات الابن',
      user: req.user,
      records,
      hasChild: true,
      childName: student.name,
      stats,
      filters: { recordType, isRead, startDate, endDate }
    });
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/parent/dashboard');
  }
});

// تعليم سجل كمقروء
router.post('/notifications/mark-read/:id', ensureParent, async (req, res) => {
  try {
    // التحقق من معلومات الابن
    const childFirstName = req.user.childFirstName;
    const childLastName = req.user.childLastName;
    
    if (!childFirstName || !childLastName) {
      req.flash('error_msg', 'لم يتم ربط حسابك بابنك بعد');
      return res.redirect('/parent/notifications');
    }
    
    // البحث عن الابن
    const student = await User.findOne({
      where: {
        role: 'student',
        name: {
          [Op.like]: `${childFirstName}%${childLastName}%`
        }
      }
    });
    
    if (!student) {
      req.flash('error_msg', 'لم يتم العثور على الابن');
      return res.redirect('/parent/notifications');
    }
    
    // جلب السجل والتحقق منه
    const record = await StudentRecord.findOne({
      where: {
        id: req.params.id,
        studentId: student.id
      }
    });
    
    if (!record) {
      req.flash('error_msg', 'السجل غير موجود');
      return res.redirect('/parent/notifications');
    }
    
    // تعليم كمقروء
    record.isRead = true;
    record.readAt = new Date();
    await record.save();
    
    req.flash('success_msg', 'تم تعليم الإشعار كمقروء');
    res.redirect('/parent/notifications');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/parent/notifications');
  }
});

// تعليم جميع السجلات كمقروءة
router.post('/notifications/mark-all-read', ensureParent, async (req, res) => {
  try {
    // التحقق من معلومات الابن
    const childFirstName = req.user.childFirstName;
    const childLastName = req.user.childLastName;
    
    if (!childFirstName || !childLastName) {
      req.flash('error_msg', 'لم يتم ربط حسابك بابنك بعد');
      return res.redirect('/parent/notifications');
    }
    
    // البحث عن الابن
    const student = await User.findOne({
      where: {
        role: 'student',
        name: {
          [Op.like]: `${childFirstName}%${childLastName}%`
        }
      }
    });
    
    if (!student) {
      req.flash('error_msg', 'لم يتم العثور على الابن');
      return res.redirect('/parent/notifications');
    }
    
    // تحديث جميع السجلات غير المقروءة
    const result = await StudentRecord.update(
      { 
        isRead: true,
        readAt: new Date()
      },
      { 
        where: { 
          studentId: student.id,
          isRead: false
        } 
      }
    );
    
    req.flash('success_msg', `تم تعليم ${result[0]} إشعار كمقروء`);
    res.redirect('/parent/notifications');
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/parent/notifications');
  }
});

module.exports = router;

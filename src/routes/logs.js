const express = require('express');
const router = express.Router();
const { ensureAdmin } = require('../middleware/auth');
const AdminLog = require('../models/AdminLog');
const User = require('../models/User');
const { Op } = require('sequelize');

// صفحة عرض جميع السجلات
router.get('/', ensureAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    
    const { action, userId, startDate, endDate } = req.query;
    
    // بناء شروط البحث
    const where = {};
    
    if (action) {
      where.action = action;
    }
    
    if (userId) {
      where.userId = userId;
    }
    
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.created_at[Op.lte] = new Date(endDate + ' 23:59:59');
      }
    }
    
    // جلب السجلات مع معلومات المستخدم
    const { count, rows: logs } = await AdminLog.findAndCountAll({
      where,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }],
      order: [['created_at', 'DESC']],
      limit,
      offset
    });
    
    // جلب جميع المستخدمين للفلترة
    const users = await User.findAll({
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']]
    });
    
    // حساب عدد الصفحات
    const totalPages = Math.ceil(count / limit);
    
    res.render('admin/logs', {
      title: 'سجلات النظام',
      user: req.user,
      logs,
      users,
      currentPage: page,
      totalPages,
      totalLogs: count,
      filters: { action, userId, startDate, endDate }
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ في تحميل السجلات');
    res.redirect('/admin/dashboard');
  }
});

// عرض تفاصيل سجل معين
router.get('/:id', ensureAdmin, async (req, res) => {
  try {
    const log = await AdminLog.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });
    
    if (!log) {
      req.flash('error_msg', 'السجل غير موجود');
      return res.redirect('/logs');
    }
    
    res.render('admin/log-detail', {
      title: 'تفاصيل السجل',
      user: req.user,
      log
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ');
    res.redirect('/logs');
  }
});

// حذف السجلات القديمة
router.post('/cleanup', ensureAdmin, async (req, res) => {
  try {
    const { days } = req.body;
    const daysToKeep = parseInt(days) || 30;
    
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysToKeep);
    
    const deletedCount = await AdminLog.destroy({
      where: {
        created_at: {
          [Op.lt]: dateThreshold
        }
      }
    });
    
    req.flash('success_msg', `تم حذف ${deletedCount} سجل قديم`);
    res.redirect('/logs');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ أثناء الحذف');
    res.redirect('/logs');
  }
});

// تصدير السجلات كـ CSV
router.get('/export/csv', ensureAdmin, async (req, res) => {
  try {
    const logs = await AdminLog.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }],
      order: [['created_at', 'DESC']],
      limit: 1000
    });
    
    // بناء CSV
    let csv = 'التاريخ,المستخدم,البريد الإلكتروني,الإجراء,الوصف,عنوان IP\n';
    
    logs.forEach(log => {
      const userName = log.user ? log.user.name : 'غير معروف';
      const userEmail = log.user ? log.user.email : '';
      const date = new Date(log.created_at).toLocaleString('ar-TN');
      
      csv += `"${date}","${userName}","${userEmail}","${log.action}","${log.description}","${log.ipAddress || ''}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=logs_${Date.now()}.csv`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8
    
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'حدث خطأ في التصدير');
    res.redirect('/logs');
  }
});

module.exports = router;

const AdminLog = require('../models/AdminLog');

// Middleware لتسجيل إجراءات المدير تلقائياً
const logAdminAction = (action, targetType = null) => {
  return async (req, res, next) => {
    // حفظ الدالة الأصلية
    const originalSend = res.send;
    const originalJson = res.json;
    const originalRedirect = res.redirect;

    // تسجيل الإجراء عند نجاح العملية
    const logAction = async () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          const logData = {
            userId: req.user ? req.user.id : null,
            action: action,
            targetType: targetType,
            targetId: req.params.id || null,
            description: `${req.user ? req.user.name : 'مجهول'} قام بـ ${action}`,
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            metadata: {
              method: req.method,
              url: req.originalUrl,
              body: req.body,
              params: req.params
            }
          };

          await AdminLog.createLog(logData);
        } catch (error) {
          console.error('خطأ في تسجيل الإجراء:', error);
        }
      }
    };

    // استبدال دوال الاستجابة
    res.send = function(data) {
      logAction();
      originalSend.call(this, data);
    };

    res.json = function(data) {
      logAction();
      originalJson.call(this, data);
    };

    res.redirect = function(url) {
      logAction();
      originalRedirect.call(this, url);
    };

    next();
  };
};

// دالة مساعدة لتسجيل الإجراءات مباشرة
const createLog = async (userId, action, description, options = {}) => {
  try {
    await AdminLog.createLog({
      userId,
      action,
      description,
      targetType: options.targetType || null,
      targetId: options.targetId || null,
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null,
      metadata: options.metadata || null
    });
  } catch (error) {
    console.error('خطأ في إنشاء سجل:', error);
  }
};

module.exports = { logAdminAction, createLog };

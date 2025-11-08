module.exports = {
  ensureAuthenticated: function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error_msg', 'الرجاء تسجيل الدخول للوصول إلى هذه الصفحة');
    res.redirect('/auth/login');
  },
  
  ensureGuest: function(req, res, next) {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard');
    } else {
      return next();
    }
  },
  
  ensureTeacher: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'teacher') {
      return next();
    }
    req.flash('error_msg', 'ليس لديك صلاحية للوصول إلى هذه الصفحة');
    res.redirect('/');
  },
  
  ensureStudent: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'student') {
      return next();
    }
    req.flash('error_msg', 'ليس لديك صلاحية للوصول إلى هذه الصفحة');
    res.redirect('/');
  },
  
  ensureParent: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'parent') {
      return next();
    }
    req.flash('error_msg', 'ليس لديك صلاحية للوصول إلى هذه الصفحة');
    res.redirect('/');
  },
  
  ensureAdmin: function(req, res, next) {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    req.flash('error_msg', 'ليس لديك صلاحية للوصول إلى هذه الصفحة');
    res.redirect('/');
  }
};

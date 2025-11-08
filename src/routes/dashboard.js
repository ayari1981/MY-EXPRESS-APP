const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../middleware/auth');

// لوحة التحكم الموحدة - توجيه حسب نوع المستخدم
router.get('/', ensureAuthenticated, (req, res) => {
  switch (req.user.role) {
    case 'teacher':
      res.redirect('/teacher/dashboard');
      break;
    case 'student':
      res.redirect('/student/dashboard');
      break;
    case 'parent':
      res.redirect('/parent/dashboard');
      break;
    case 'admin':
      res.redirect('/admin/dashboard');
      break;
    default:
      res.redirect('/');
  }
});

module.exports = router;

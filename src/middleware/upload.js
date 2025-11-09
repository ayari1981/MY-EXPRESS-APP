const multer = require('multer');
const path = require('path');

// إعدادات تخزين الملفات
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (file.fieldname === 'lessonFile') {
      cb(null, 'uploads/lessons/');
    } else if (file.fieldname === 'profilePicture') {
      cb(null, 'uploads/profile-pics/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// فلتر أنواع الملفات
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'lessonFile') {
    // قبول ملفات الدروس فقط
    const allowedExtensions = /pdf|docx?|pptx?/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
    
    // قائمة MIME types المقبولة
    const allowedMimetypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/octet-stream' // بعض المتصفحات ترسل هذا
    ];
    
    const mimetypeAllowed = allowedMimetypes.includes(file.mimetype);
    
    if (extname && (mimetypeAllowed || extname)) {
      return cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مسموح. يرجى رفع ملفات PDF، Word، أو PowerPoint فقط'));
    }
  } else if (file.fieldname === 'profilePicture') {
    // قبول صور فقط
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('نوع الملف غير مسموح. يرجى رفع صور فقط'));
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE || 10485760 // 10MB
  },
  fileFilter: fileFilter
});

module.exports = upload;

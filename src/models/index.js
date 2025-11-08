const User = require('./User');
const Lesson = require('./Lesson');
const Comment = require('./Comment');
const Notification = require('./Notification');
const Feedback = require('./Feedback');
const AdminLog = require('./AdminLog');
const Schedule = require('./Schedule');
const Grade = require('./Grade');
const StudentRecord = require('./StudentRecord');

// تعريف العلاقات بين النماذج
const models = {
  User,
  Lesson,
  Comment,
  Notification,
  Feedback,
  AdminLog,
  Schedule,
  Grade,
  StudentRecord
};

// تطبيق العلاقات
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;

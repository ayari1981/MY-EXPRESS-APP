const User = require('./User');
const Lesson = require('./Lesson');
const Comment = require('./Comment');
const Notification = require('./Notification');
const Feedback = require('./Feedback');
const AdminLog = require('./AdminLog');
const Schedule = require('./Schedule');

// تعريف العلاقات بين النماذج
const models = {
  User,
  Lesson,
  Comment,
  Notification,
  Feedback,
  AdminLog,
  Schedule
};

// تطبيق العلاقات
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;

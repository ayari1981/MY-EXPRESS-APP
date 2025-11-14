const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  studentClass: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'student_class'
  },
  classNumber: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'class_number'
  },
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'teacher_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false,
    field: 'file_url'
  },
  fileName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'file_name'
  },
  fileType: {
    type: DataTypes.ENUM('pdf', 'docx', 'doc', 'pptx', 'ppt'),
    allowNull: false,
    field: 'file_type'
  },
  fileSize: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'file_size'
  },
  downloads: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_approved'
  }
}, {
  tableName: 'lessons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// إضافة العلاقات
Lesson.associate = function(models) {
  Lesson.belongsTo(models.User, {
    foreignKey: 'teacherId',
    as: 'teacher'
  });
  Lesson.hasMany(models.Comment, {
    foreignKey: 'lessonId',
    as: 'comments'
  });
};

module.exports = Lesson;

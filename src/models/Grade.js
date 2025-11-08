const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Grade = sequelize.define('Grade', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // معلومات التلميذ
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'student_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  studentFirstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'student_first_name'
  },
  studentLastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'student_last_name'
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
  
  // معلومات المادة والأستاذ
  teacherId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'teacher_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  teacherFirstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'teacher_first_name'
  },
  teacherLastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'teacher_last_name'
  },
  subject: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  
  // معلومات العلامة
  gradeType: {
    type: DataTypes.ENUM('فرض عادي', 'فرض تأليفي', 'شفاهي'),
    allowNull: false,
    field: 'grade_type'
  },
  gradeValue: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    field: 'grade_value',
    validate: {
      min: 0,
      max: 20
    }
  },
  maxGrade: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 20,
    field: 'max_grade'
  },
  
  // معلومات إضافية
  semester: {
    type: DataTypes.ENUM('الفصل الأول', 'الفصل الثاني', 'الفصل الثالث'),
    allowNull: false
  },
  academicYear: {
    type: DataTypes.STRING(20),
    allowNull: false,
    field: 'academic_year',
    defaultValue: '2024-2025'
  },
  examDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'exam_date'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // الحالة
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_published'
  }
}, {
  tableName: 'grades',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['student_id'] },
    { fields: ['teacher_id'] },
    { fields: ['student_class'] },
    { fields: ['subject'] },
    { fields: ['semester'] },
    { fields: ['academic_year'] },
    { fields: ['is_published'] }
  ]
});

// إضافة العلاقات
Grade.associate = function(models) {
  Grade.belongsTo(models.User, {
    foreignKey: 'studentId',
    as: 'student'
  });
  Grade.belongsTo(models.User, {
    foreignKey: 'teacherId',
    as: 'teacher'
  });
};

module.exports = Grade;

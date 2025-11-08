const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const StudentRecord = sequelize.define('StudentRecord', {
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
  
  // نوع السجل
  recordType: {
    type: DataTypes.ENUM('absence', 'punishment', 'note'),
    allowNull: false,
    field: 'record_type',
    comment: 'نوع السجل: غياب، عقوبة، ملاحظة'
  },
  
  // معلومات السجل
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'date',
    comment: 'تاريخ الغياب أو العقوبة'
  },
  
  // للغيابات
  absenceType: {
    type: DataTypes.ENUM('justified', 'unjustified'),
    allowNull: true,
    field: 'absence_type',
    comment: 'نوع الغياب: مبرر أو غير مبرر'
  },
  
  // للعقوبات
  punishmentType: {
    type: DataTypes.ENUM('warning', 'detention', 'suspension', 'other'),
    allowNull: true,
    field: 'punishment_type',
    comment: 'نوع العقوبة'
  },
  punishmentSeverity: {
    type: DataTypes.ENUM('minor', 'medium', 'severe'),
    allowNull: true,
    field: 'punishment_severity',
    comment: 'خطورة العقوبة'
  },
  
  // الوصف
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'description',
    comment: 'وصف الغياب أو العقوبة أو الملاحظة'
  },
  
  // معلومات المسجل
  recordedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'recorded_by',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: 'المعلم أو الإداري الذي سجل السجل'
  },
  recordedByName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'recorded_by_name'
  },
  recordedByRole: {
    type: DataTypes.ENUM('teacher', 'admin'),
    allowNull: false,
    field: 'recorded_by_role'
  },
  
  // حالة الإشعار
  parentNotified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'parent_notified',
    comment: 'هل تم إشعار الولي'
  },
  notifiedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'notified_at',
    comment: 'تاريخ إشعار الولي'
  },
  
  // حالة القراءة
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read',
    comment: 'هل قرأها الولي'
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at'
  },
  
  // السنة الدراسية
  academicYear: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '2024-2025',
    field: 'academic_year'
  }
}, {
  tableName: 'student_records',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['student_id'] },
    { fields: ['student_first_name', 'student_last_name'] },
    { fields: ['record_type'] },
    { fields: ['date'] },
    { fields: ['parent_notified'] },
    { fields: ['is_read'] },
    { fields: ['recorded_by'] },
    { fields: ['student_class', 'class_number'] }
  ]
});

// تعريف العلاقات
StudentRecord.associate = function(models) {
  // العلاقة مع الطالب
  StudentRecord.belongsTo(models.User, {
    foreignKey: 'studentId',
    as: 'student'
  });
  
  // العلاقة مع المسجل (معلم أو إداري)
  StudentRecord.belongsTo(models.User, {
    foreignKey: 'recordedBy',
    as: 'recorder'
  });
};

module.exports = StudentRecord;

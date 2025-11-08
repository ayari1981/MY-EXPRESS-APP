const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Schedule = sequelize.define('Schedule', {
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
  classLevel: {
    type: DataTypes.ENUM('السابعة أساسي', 'الثامنة أساسي', 'التاسعة أساسي', 'جميع الأقسام'),
    allowNull: false,
    field: 'class_level'
  },
  scheduleType: {
    type: DataTypes.ENUM('تلاميذ', 'أساتذة'),
    allowNull: false,
    field: 'schedule_type'
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
    type: DataTypes.ENUM('pdf', 'docx', 'doc', 'xlsx', 'jpg', 'png'),
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
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  uploadedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'uploaded_by',
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'schedules',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// إضافة العلاقات
Schedule.associate = function(models) {
  Schedule.belongsTo(models.User, {
    foreignKey: 'uploadedBy',
    as: 'uploader'
  });
};

module.exports = Schedule;

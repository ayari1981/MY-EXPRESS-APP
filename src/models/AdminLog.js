const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AdminLog = sequelize.define('AdminLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'نوع الإجراء: login, logout, create_user, delete_user, approve_comment, etc.'
  },
  targetType: {
    type: DataTypes.ENUM('user', 'lesson', 'comment', 'feedback', 'system'),
    allowNull: true,
    field: 'target_type',
    comment: 'نوع الكائن المستهدف'
  },
  targetId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'target_id',
    comment: 'معرف الكائن المستهدف'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'وصف الإجراء'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address',
    comment: 'عنوان IP للمستخدم'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent',
    comment: 'معلومات المتصفح'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'بيانات إضافية بصيغة JSON',
    get() {
      const rawValue = this.getDataValue('metadata');
      return rawValue ? JSON.parse(rawValue) : null;
    },
    set(value) {
      this.setDataValue('metadata', value ? JSON.stringify(value) : null);
    }
  }
}, {
  tableName: 'admin_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// إضافة العلاقات
AdminLog.associate = function(models) {
  AdminLog.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user'
  });
};

// دالة مساعدة لإنشاء سجل
AdminLog.createLog = async function(data) {
  try {
    return await AdminLog.create(data);
  } catch (error) {
    console.error('خطأ في إنشاء سجل المدير:', error);
  }
};

module.exports = AdminLog;

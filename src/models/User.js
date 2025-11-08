const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('student', 'teacher', 'parent', 'admin'),
    allowNull: false,
    defaultValue: 'student'
  },
  // معلومات التلميذ
  studentClass: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'student_class'
  },
  classNumber: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'class_number'
  },
  studentSection: {
    type: DataTypes.STRING(10),
    allowNull: true,
    field: 'student_section'
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'parent_id'
  },
  // معلومات المدرس
  teacherSubject: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'teacher_subject'
  },
  teacherClasses: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'teacher_classes',
    get() {
      const rawValue = this.getDataValue('teacherClasses');
      return rawValue ? JSON.parse(rawValue) : [];
    },
    set(value) {
      this.setDataValue('teacherClasses', JSON.stringify(value || []));
    }
  },
  // معلومات الولي
  parentPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'parent_phone'
  },
  childFirstName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'child_first_name'
  },
  childLastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'child_last_name'
  },
  profilePicture: {
    type: DataTypes.STRING(255),
    defaultValue: '/images/default-avatar.png',
    field: 'profile_picture'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// دالة مساعدة للتحقق من كلمة المرور
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// إضافة العلاقات
User.associate = function(models) {
  User.hasMany(models.Lesson, {
    foreignKey: 'teacherId',
    as: 'lessons'
  });
  User.hasMany(models.Comment, {
    foreignKey: 'userId',
    as: 'comments'
  });
  User.hasMany(models.Notification, {
    foreignKey: 'userId',
    as: 'notifications'
  });
  User.hasMany(models.Feedback, {
    foreignKey: 'parentId',
    as: 'feedbacks'
  });
  User.belongsTo(models.User, {
    foreignKey: 'parentId',
    as: 'parent'
  });
  User.hasMany(models.User, {
    foreignKey: 'parentId',
    as: 'children'
  });
};

module.exports = User;

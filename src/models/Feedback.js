const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'parent_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewed', 'responded'),
    defaultValue: 'pending'
  },
  adminResponse: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'admin_response'
  },
  respondedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'responded_at'
  }
}, {
  tableName: 'feedbacks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// إضافة العلاقات
Feedback.associate = function(models) {
  Feedback.belongsTo(models.User, {
    foreignKey: 'parentId',
    as: 'parent'
  });
};

module.exports = Feedback;

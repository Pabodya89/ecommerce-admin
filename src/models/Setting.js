const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Setting = sequelize.define('Setting', {
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[a-z0-9_]+$/,    
      },
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    group: {
      type: DataTypes.STRING(50),
      defaultValue: 'general',  
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    tableName: 'Settings',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['key'] },
      { fields: ['group'] },            
    ],
  });

  return Setting;
};
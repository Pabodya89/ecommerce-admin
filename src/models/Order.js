const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define('Order', {
    orderNumber: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false,
      defaultValue: () => `ORD-${Date.now()}`,  
    },
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
      defaultValue: 'pending',
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    taxAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    discountAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    shippingAddress: {
      type: DataTypes.TEXT,      
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'Orders',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['orderNumber'] },
      { fields: ['UserId'] },          
      { fields: ['status'] },           
      { fields: ['createdAt'] },        
      { fields: ['UserId', 'status'] }, 
      { fields: ['UserId', 'createdAt'] },  
    ],
  });

  return Order;
};
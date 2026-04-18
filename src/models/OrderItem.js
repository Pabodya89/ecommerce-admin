const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define('OrderItem', {
    OrderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Orders', key: 'id' },
    },
    ProductId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Products', key: 'id' },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,           
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,           // quantity × unitPrice 
    },
  }, {
    tableName: 'OrderItems',
    timestamps: true,
    updatedAt: false,             
    indexes: [
      { fields: ['OrderId'] },          
      { fields: ['ProductId'] },        
      { fields: ['OrderId', 'ProductId'] },  
    ],
  });

  return OrderItem;
};
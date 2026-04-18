const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Product = sequelize.define('Product', {
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true },
    },
    slug: {
      type: DataTypes.STRING(220),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),   
      allowNull: false,
      validate: { min: 0 },
    },
    comparePrice: {
      type: DataTypes.DECIMAL(10, 2),   
      validate: { min: 0 },
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    sku: {
      type: DataTypes.STRING(100),      //  unique product code
      allowNull: true,
      unique: true,
    },
    CategoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'Categories', key: 'id' },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'Products',
    timestamps: true,
    paranoid: true,               
    indexes: [
      { unique: true, fields: ['slug'] },
      { unique: true, fields: ['sku'] },
      { fields: ['CategoryId'] },       
      { fields: ['isActive'] },
      { fields: ['price'] },            
      { fields: ['stock'] },            
      { fields: ['createdAt'] },        
    ],
  });

  return Product;
};
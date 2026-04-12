const sequelize = require('../config/database')

const User = require('./User')(sequelize);
const Category = require('./Category')(sequelize);
const Order = require('./Order')(sequelize);
const OrderItem = require('./OrderItem')(sequelize);
const Product = require('./Product')(sequelize);
const Setting = require('./Setting')(sequelize);

//relations
// Category self-reference (subcategories)
Category.hasMany(Category,  { foreignKey: 'parentId', as: 'subcategories' });
Category.belongsTo(Category,{ foreignKey: 'parentId', as: 'parent' });

// Category → Products
Category.hasMany(Product,   { foreignKey: 'CategoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'CategoryId', as: 'category' });

// User → Orders
User.hasMany(Order,         { foreignKey: 'UserId', as: 'orders' });
Order.belongsTo(User,       { foreignKey: 'UserId', as: 'user' });

// Order → OrderItems
Order.hasMany(OrderItem,    { foreignKey: 'OrderId', as: 'items' });
OrderItem.belongsTo(Order,  { foreignKey: 'OrderId', as: 'order' });

// Product → OrderItems
Product.hasMany(OrderItem,  { foreignKey: 'ProductId', as: 'orderItems' });
OrderItem.belongsTo(Product,{ foreignKey: 'ProductId', as: 'product' });

module.exports = { sequelize, User, Category, Product, Order, OrderItem, Setting };

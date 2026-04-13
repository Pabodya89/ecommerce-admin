const { User, Product, Order, OrderItem, Setting } = require('../models');

const { Op } = require('sequelize');

const dashboardHandler = async(request, response, context) => {
    const { currentAdmin } = context;

    if(currentAdmin.role === 'admin') {
        const [totalUsers, totalOrders, totalProducts, revenue, recentOrders] = await Promise.all([
            User.count(),
            Order.count(),
            Product.count(),
            Order.sum('totalAmount'),
            Order.findAll({
                limit:5,
                order: [['createdAt', 'DESC']],
                include:[{ association: 'user', attributes: ['name', 'email'] }],
            }), 
        ]);

        return {
            role: 'admin',
            stats: {
                totalUsers,
                totalOrders,
                totalProducts,
                revenue: revenue || 0,
            },
            recentOrders,
        };
    }

    const order = await Order.findAll({
        where:  { UserId: currentAdmin.id },
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ association: 'items', include: ['product'] }],
    });

    const totalSpent = await Order.sum('totalAmount', {
        where: { UserId: currentAdmin.id },
    });

    return {
        role: 'user',
        name: currentAdmin.name,
        orders,
        totalSpent: totalSpent || 0,
    };
};

module.exports = { dashboardHandler };
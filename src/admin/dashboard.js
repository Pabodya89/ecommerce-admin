const { User, Category, Product, Order } = require('../models');

const dashboardHandler = async (request, response, context) => {
    const { currentAdmin } = context;

    if (!currentAdmin) {
        return {
            role: 'guest',
            stats: {
                totalUsers: 0,
                totalCategories: 0,
                totalOrders: 0,
                totalProducts: 0,
                revenue: 0,
            },
            recentOrders: [],
            name: 'Guest',
            orders: [],
            totalOrders: 0,
            totalSpent: 0,
        };
    }

    if (currentAdmin?.role === 'admin') {
        const [totalUsers, totalCategories, totalOrders, totalProducts, revenue, recentOrders] = await Promise.all([
            User.count(),
            Category.count(),
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
                totalCategories,
                totalOrders,
                totalProducts,
                revenue: revenue || 0,
            },
            recentOrders,
        };
    }

    const orders = await Order.findAll({
        where:  { UserId: currentAdmin.id },
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [{ association: 'items', include: ['product'] }],
    });

    const totalSpent = await Order.sum('totalAmount', {
        where: { UserId: currentAdmin.id },
    });

    const totalOrders = await Order.count({ where: { UserId: currentAdmin.id } });

    return {
        role: 'user',
        name: currentAdmin.name,
        orders,
        totalOrders,
        totalSpent: totalSpent || 0,
    };
};

module.exports = { dashboardHandler };
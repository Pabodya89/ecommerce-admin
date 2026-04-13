const AdminJS = require('adminjs');
const AdminJSSequelize = require('@adminjs/sequelize');
const { Category, OrderItem, Setting } = require('../models');
const { dashboardHandler } = require('./dashboard');
const userResource = require('./resources/userResource');
const productResource = require('./resources/productResource');
const orderResource = require('./resources/orderResource');

AdminJS.registerAdapter(AdminJSSequelize);

const isAdmin = ({ currentAdmin }) => currentAdmin?.role === 'admin';

const adminJs = new AdminJS ({
    resources: [
        userResource,
        productResource,
        orderResource,
        { resource: Category, options: { navigation: { name: 'Catalog', icon: 'Tag' } } },
        { resource: Category, options: { navigation: { name: 'Catalog', icon: 'Tag' } } },
        {
            resource: Setting,
            options: {
                navigation: { name: 'System', icon: 'Settings' },
                actions : {
                    list: { isAccessible: isAdmin },
                    show: { isAccessible: isAdmin },
                    new: { isAccessible: isAdmin },
                    edit: { isAccessible: isAdmin },
                    delte: { isAccessible: isAdmin },
                },
            },
        },
    ],
    dashboard: { handler: dashboardHandler },
    branding: {
        companyName: 'eCommerce Admin',
        softwareBrother: false ,
        logo : false ,
    },
    rootpath: '/admin',
});

module.exports = adminJs;
const AdminJSImport = require('adminjs');
const AdminJS = AdminJSImport.default || AdminJSImport;
const { dashboardHandler } = require('./dashboard');
const { componentLoader, Components } = require('./componentLoader');
const userResource = require('./resources/userResource');
const categoryResource = require('./resources/categoryResource');
const productResource = require('./resources/productResource');
const orderResource = require('./resources/orderResource');
const orderItemResource = require('./resources/orderItemResource');
const settingResource = require('./resources/settingResource');

const isAdmin = ({ currentAdmin }) => currentAdmin?.role === 'admin';

async function buildAdminJS() {
    const AdminJSSequelize = await import('@adminjs/sequelize');
    const Database = AdminJSSequelize.Database || AdminJSSequelize.default?.Database;
    const Resource = AdminJSSequelize.Resource || AdminJSSequelize.default?.Resource;

    if (!Database || !Resource) {
        throw new Error('Unable to load @adminjs/sequelize adapter exports.');
    }

    AdminJS.registerAdapter({ Database, Resource });

    return new AdminJS({
        componentLoader,
        resources: [
            userResource,
            categoryResource,
            productResource,
            orderResource,
            orderItemResource,
            settingResource,
        ],
        dashboard: {
            handler: dashboardHandler,
            component: Components.Dashboard,
        },
        branding: {
            companyName: 'eCommerce Admin',
            logo: false,
            softwareBrothers: false,
        },
        rootPath: '/admin',
    });
}

module.exports = { buildAdminJS };
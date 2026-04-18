const { User } = require('../../models');

const isAdmin = ({ currentAdmin }) => currentAdmin?.role === 'admin';

module.exports = {
    resource: User,
    options: {
        id: 'User',
        titleProperty: 'email',
        navigation: { name: 'User Management', icon: 'User' },
        properties: {
            password: { isVisible: false },
            newPassword: {
                type: 'password',
                isVisible: { list: false, show: false, filter: false, edit: true, new: true },
            },
            role: { isVisible: { list: true, show: true, edit: true, filter: true, new: true } },
            createdAt: { isVisible: { list: true, show: true, edit: false, filter: true, new: false } },
            updatedAt: { isVisible: { list: false, show: true, edit: false, filter: false, new: false } },
            deletedAt: { isVisible: false },
        },
        actions: {
            list: { isAccessible: isAdmin, isVisible: isAdmin },
            show: { isAccessible: isAdmin, isVisible: isAdmin },
            new: {
                isAccessible: isAdmin,
                isVisible: isAdmin,
                before: async (request) => {
                    if (request.payload?.newPassword) {
                        const bcrypt = require('bcryptjs');
                        request.payload.password = await bcrypt.hash(request.payload.newPassword, 10);
                    }
                    delete request.payload?.newPassword;
                    return request;
                },
            },
            edit: {
                isAccessible: isAdmin,
                isVisible: isAdmin,
                before: async (request) => {
                    if (request.payload?.newPassword) {
                        const bcrypt = require('bcryptjs');
                        request.payload.password = await bcrypt.hash(request.payload.newPassword, 10);
                    }
                    delete request.payload?.newPassword;
                    return request;
                },
            },
            delete: { isAccessible: isAdmin, isVisible: isAdmin },
            bulkDelete: { isAccessible: isAdmin, isVisible: isAdmin },
        },
    },
};
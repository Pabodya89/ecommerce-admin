const { request } = require('express');
const { User } = require('../../models');

const isAdmin = ({ currentAdmin }) => currentAdmin?.role === 'admin';

module.exports = {
    resource: User,
    options: {
        navigation: { name: 'User Management', icon: 'User' },
        properties: {
            password: { isVisible: false },
            role: { isVisible: { list: true, show: true, edit: true, filter: true, new: true } },
            createdAt: { isVisible: { list: true, show: true, edit: false, filter: true, new: false } },
        },
        actions: {
            list: { isAccessible: isAdmin },
            show: { isAccessible: isAdmin },
            new: { isAccessible: isAdmin,
                    before: async (request) => {
                        if (request.payload?.password) {
                            const bcrypt = require('bcryptjs');
                            request.payload.password = await bcrypt.hash(request.payload.password, 10);
                        }
                        return request;
                    } },
            edit: { isAccessible: isAdmin },
            delete: { isAccessible: isAdmin },        
        },
    },
};
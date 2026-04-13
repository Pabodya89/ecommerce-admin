const { Order } = require('../../models');

module.exports = {
    resource: Order,
    options: {
        navigation: { name: 'Orders', icon: 'ShoppingCart' },
        properties: {
            totalAmount: { 
                isVisible: { list: true, show: true, edit: false, new: false }
            },
        },
    }
};
const { Product } = require('../../models');

module.exports = {
    resource: Product,
    options: {
        navigation: { name: 'Catalog', icon: 'Box' },
        properties: {
            description: { type: 'textarea' },
        },
    },
};
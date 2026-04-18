const { Product } = require('../../models');

module.exports = {
    resource: Product,
    options: {
        id: 'Product',
        titleProperty: 'name',
        navigation: { name: 'Catalog', icon: 'Box' },
        properties: {
            description: { type: 'textarea' },
            CategoryId: { reference: 'Category' },
            deletedAt: { isVisible: false },
        },
    },
};
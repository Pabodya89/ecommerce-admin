const { Category } = require('../../models');

module.exports = {
  resource: Category,
  options: {
    id: 'Category',
    titleProperty: 'name',
    navigation: { name: 'Catalog', icon: 'Tag' },
    properties: {
      parentId: {
        reference: 'Category',
        isRequired: false,
        props: {
          isClearable: true,
          placeholder: 'None (Main Category)',
        },
      },
      description: { type: 'textarea' },
    },
    actions: {
      new: {
        before: async (request) => {
          if (request.payload?.parentId === '' || request.payload?.parentId == null) {
            request.payload.parentId = null;
          }
          return request;
        },
      },
      edit: {
        before: async (request) => {
          if (request.payload?.parentId === '' || request.payload?.parentId == null) {
            request.payload.parentId = null;
          }
          return request;
        },
      },
    },
  },
};

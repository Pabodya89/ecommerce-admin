const { Setting } = require('../../models');

const isAdmin = ({ currentAdmin }) => currentAdmin?.role === 'admin';

module.exports = {
  resource: Setting,
  options: {
    id: 'Setting',
    titleProperty: 'key',
    navigation: { name: 'System', icon: 'Settings' },
    properties: {
      value: { type: 'textarea' },
    },
    actions: {
      list: { isAccessible: isAdmin, isVisible: isAdmin },
      show: { isAccessible: isAdmin, isVisible: isAdmin },
      new: { isAccessible: isAdmin, isVisible: isAdmin },
      edit: { isAccessible: isAdmin, isVisible: isAdmin },
      delete: { isAccessible: isAdmin, isVisible: isAdmin },
      bulkDelete: { isAccessible: isAdmin, isVisible: isAdmin },
    },
  },
};

const path = require('node:path');
const AdminJSImport = require('adminjs');
const ComponentLoader = AdminJSImport.ComponentLoader || AdminJSImport.default?.ComponentLoader;

const componentLoader = new ComponentLoader();

const Components = {
  Dashboard: componentLoader.add('Dashboard', path.join(__dirname, 'components/Dashboard')),
  SettingsPage: componentLoader.add('SettingsPage', path.join(__dirname, 'components/SettingsPage')),
};

module.exports = { componentLoader, Components };

const { Setting } = require('../../models');

async function settingsPageHandler(req, res, context) {
    const { currentAdmin } = context;

    // Only admin users can access settings
    if (currentAdmin?.role !== 'admin') {
        return {
            text: 'Access Denied',
        };
    }

    if (req.method === 'GET') {
        try {
            const settings = await Setting.findAll();
            const settingsObj = {};
            settings.forEach(setting => {
                settingsObj[setting.key] = setting.value;
            });
            return {
                settings: settingsObj,
            };
        } catch (error) {
            console.error('Error fetching settings:', error);
            return {
                error: 'Failed to fetch settings',
                settings: {},
            };
        }
    }

    if (req.method === 'POST') {
        try {
            const { settings } = req.body;
            if (!settings || typeof settings !== 'object') {
                return {
                    error: 'Invalid settings format',
                };
            }

            for (const [key, value] of Object.entries(settings)) {
                await Setting.upsert({ key, value });
            }

            return {
                success: true,
                message: 'Settings saved successfully',
            };
        } catch (error) {
            console.error('Error saving settings:', error);
            return {
                error: 'Failed to save settings',
            };
        }
    }

    return {
        text: 'Method not allowed',
    };
}

module.exports = { settingsPageHandler };

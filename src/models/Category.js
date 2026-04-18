const { DataTypes } = require('sequelize');

module.exports = function defineCategory(sequelize) {
    const Category = sequelize.define('Category', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: { notEmpty: true },
        },
        slug: {
            type: DataTypes.STRING(120),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: { model: 'Categories', key: 'id' },
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue:true,
        },
    }, {
        tableName: 'Categories',
        timestamps: true,
        indexes: [
            { unique: true, fields: ['slug'] },
            { fields: ['parentId'] },
            { fields: ['isActive'] },
        ],
    });

    return Category;
};
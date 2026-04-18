const { DataTypes } = require('sequelize');

module.exports = function defineUser(sequelize) {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: { notEmpty: true, len: [2 , 100] },
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'user'),
            defaultValue: 'user',
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        lastLoginAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'Users',
        timestamps: true,
        paranoid: true, //soft delete
        indexes: [
            { unique: true, fields:['email'] },
            { fields: ['role'] },
            { fields: ['isActive'] },
            { fields: ['createdAt'] },
        ],
    });

    return User;
};
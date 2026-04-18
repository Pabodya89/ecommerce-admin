// const { Sequelize } = require ('sequelize');
// require('dotenv').config();

// const sequelize = new Sequelize(
//     process.env.DB_NAME,
//     process.env.DB_USER,
//     process.env.DB_PASSWORD,
//     {
//         host: process.env.DB_HOST || 'localhost',
//         port: process.env.DB_PORT || 5432,
//         dialect: 'postgres',
//         logging: process.env.NODE_ENV === 'development' ? console.log: false,
//         pool : {
//             max : 5,
//             min : 0,
//             acquire: 30000,
//             idle: 10000,
//         } ,
//         dialectOptions:
//         process.env.NODE_ENV === 'production'
//          ? { ssl: { require: true, rejectUnauthorized: false } }
//          : {},
//     }
// );

// module.exports = sequelize;

const { Sequelize } = require('sequelize')
require('dotenv').config()

const isProduction = process.env.NODE_ENV === 'production'
const commonOptions = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
}

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, commonOptions)
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        ...commonOptions,
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 5432),
      }
    )

module.exports = sequelize
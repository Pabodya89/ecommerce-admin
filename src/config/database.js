const { Sequelize } = require('sequelize')
require('dotenv').config()

const isProduction = process.env.NODE_ENV === 'production'

const resolveDbHost = () => {
  const rawHost = String(process.env.DB_HOST || '').trim()

  // Supports values like "postgres || localhost" for environment-based fallback.
  if (rawHost.includes('||')) {
    const [productionHost, localHost] = rawHost
      .split('||')
      .map((part) => part.trim())
      .filter(Boolean)

    if (isProduction) return productionHost || localHost || 'localhost'
    return localHost || productionHost || 'localhost'
  }

  return rawHost || 'localhost'
}

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
        host: resolveDbHost(),
        port: Number(process.env.DB_PORT || 5432),
      }
    )

module.exports = sequelize
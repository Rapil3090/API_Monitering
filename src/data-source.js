const { DataSource } = require('typeorm');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: true,
  entities: ['src/entities/*.js'],
  migrations: ['src/migrations/*.js'],
});

module.exports = AppDataSource;

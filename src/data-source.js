const { DataSource } = require('typeorm');
const ApiEndpoint = require('./entities/ApiEndpoint');
require('dotenv').config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,       
  port: process.env.PG_PORT,       
  username: process.env.PG_USER,   
  password: process.env.PG_PASSWORD, 
  database: process.env.PG_DATABASE,
  synchronize: true,
  logging: true,
  entities: ['src/entities/*.js'],
  // migrations: ['src/migrations/*.js'],
});

module.exports = AppDataSource;
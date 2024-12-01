const AppDataSource = require('../data-source');
const ApiUrl = require('../entities/ApiUrl');

const apiUrlRepository = AppDataSource.getRepository(ApiUrl);

module.exports = apiUrlRepository;

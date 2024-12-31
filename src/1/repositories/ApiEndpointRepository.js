const AppDataSource =  require('../data-source');
const ApiEndpoint = require('../entities/ApiEndpoint');

const apiEndpointRepository = AppDataSource.getRepository('ApiEndpoint');

module.exports = apiEndpointRepository;
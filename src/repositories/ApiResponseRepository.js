const AppDataSource =  require('../data-source');
const ApiResponse = require('../entities/ApiResponse');


const apiResponseRepository = AppDataSource.getRepository('ApiResponse');

module.exports = apiResponseRepository;
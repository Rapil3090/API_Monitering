const axios = require('axios');
const { query } = require('../db');
const ApiEndpointRepository =  require('../repositories/ApiEndpointRepository');
const ApiResponseRepository =  require('../repositories/ApiResponseRepository');


const getAllApiEndpoints = async () => {
  return await ApiEndpointRepository.find();
};

const scheduledApiCall = async () => {

  const apiEndpoints = await ApiEndpointRepository.find();

  apiEndpoints.forEach(apiEndpoint => {
    getApi(apiEndpoint) 
    .then(response => console.log('응답:', response))
    .catch(error => console.error('에러:', error.message));
  });
};


const intervalTime = 10000;

setInterval(scheduledApiCall, intervalTime);


const createApiEndpoint = async (url, parameters ) => {
  try {
    console.log('Creating API endpoint:', { url, parameters });
    const result = await ApiEndpointRepository.create({
      url,
      parameters: JSON.stringify(parameters)
    });
    
    return await ApiEndpointRepository.save(result);

  } catch (error) {
    console.error('Database query error:', error.message, error.stack);
    throw error;
  }
};


const getApi = async (apiEndpoint) => {

  const parameters = JSON.parse(apiEndpoint.parameters);

  console.log(apiEndpoint);

  const apiKeyValue = parameters.find(param => 
    param.type.toLowerCase() === 'apikey')?.value;

  if (!apiKeyValue) {
    throw new Error('INVALID_SERVICEKEY');
  }

  const startTime = Date.now();

  try {
    const response = await axios.get(apiEndpoint.url, {
      params: parameters.reduce((acc, param) => {
        if (param.type.toLowerCase() === 'query') {
          acc[param.key] = param.value;
        }
        return acc;
      }, {}),
      headers: parameters.reduce((acc, param) => {
        if (param.type.toLowerCase() === 'header') {
          acc[param.key] = param.value;
        }
        return acc;
      }, { 'apikey' : apiKeyValue })
    });

    const responseTime = Date.now() - startTime;
    const ApiResponse = {
      apiEndpoint,
      responseTime,
      body: response.data.substring(0, 255),
      statusCode: response.status,
      success: true
    };

    await ApiResponseRepository.save(ApiResponse);
    return ApiResponse;

  } catch (error) {
    console.error('API 호출 오류: ', error.message);
    throw new Error('UNKNOWN_ERROR');
  }
};



module.exports = { getAllApiEndpoints, createApiEndpoint };

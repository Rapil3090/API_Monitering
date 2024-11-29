// src/services/ApiEndpointService.js
const { query } = require('../db');

// 모든 API 엔드포인트 조회
const getAllApiEndpoints = async () => {
  const result = await query('SELECT * FROM apiendpoint');
  return result;
};

const createApiEndpoint = async (url, serviceKey, parameters) => {
  try {
    console.log('Creating API endpoint:', { url, serviceKey, parameters });
    const result = await query(
      'INSERT INTO apiendpoint ("url", "serviceKey", "parameters") VALUES ($1, $2, $3) RETURNING *',
      [url, serviceKey, JSON.stringify(parameters)]
    );
    return result[0];
  } catch (error) {
    console.error('Database query error:', error.message, error.stack);
    throw error;
  }
};

module.exports = { getAllApiEndpoints, createApiEndpoint };

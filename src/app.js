
const express = require('express');
const bodyParser = require('body-parser');
const { getAllApiEndpoints, createApiEndpoint } = require('./services/ApiEndpointService');
const initDb = require('./initDb');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

initDb()
.then(() => {
  console.log('Database initialized. Starting server...');
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
})
.catch((error) => {
  console.log('Failed to initialize database:', error);
  process.exit(1);
});


app.get('/api-endpoints', async (req, res) => {
  try {
    const endpoints = await getAllApiEndpoints();
    res.json(endpoints);
  } catch (error) {
    res.status(500).send('Error fetching API endpoints');
  }
});


app.post('/api-endpoints', async (req, res) => {
  const { url, serviceKey, parameters } = req.body;
  try {
    const newEndpoint = await createApiEndpoint(url, serviceKey, parameters);
    return res.status(201).json(newEndpoint);
  } catch (error) {
    console.error('Error creating API endpoint:', error.message, error.stack);
    return res.status(500).send('Error creating API endpoint');
  }
});

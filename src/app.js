
const express = require('express');
const bodyParser = require('body-parser');
const { getAllApiEndpoints, createApiEndpoint } = require('./services/ApiEndpointService');
const initDb = require('./initDb');
const AppDataSource = require('./data-source');
const crawlAndSaveUrls = require('./services/ApiUrlService');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

AppDataSource.initialize()
.then(() => {
  console.log('초기화');
})
.catch((err) => {
  console.error('에러 발생',err);
})

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
  const { url, parameters = [] } = req.body;
  try {
    const newEndpoint = await createApiEndpoint(url, parameters);
    return res.status(201).json(newEndpoint);
  } catch (error) {
    console.error('Error creating API endpoint:', error.message, error.stack);
    return res.status(500).send('Error creating API endpoint');
  }
});

app.post('/start-crawl', async (req, res) => {
  try {
    await crawlAndSaveUrls();
    res.status(200).send('크롤링 성공');
  } catch (error) {
    console.error('URL 가져오기 실패', error);
    res.status(500).send('에러 발생');
  }
});


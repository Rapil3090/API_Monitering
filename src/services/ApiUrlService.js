const puppeteer = require('puppeteer');
const ApiUrlRepository =  require('../repositories/ApiUrlRepository');

const urlPattern = [
  'http://apis.data.go.kr',
  'https://openapi',
  'http://openapi.onbid.co.kr'
];

async function crawlAndSaveUrls() {
  const browser = await puppeteer.launch({ headless: true });

  for (let j = 1; j < 1173; j++) {
    console.log(`현재 페이지: ${j}`);
    const page = await browser.newPage();

    try {
      await page.goto(`https://www.data.go.kr/tcs/dss/selectDataSetList.do?dType=API&currentPage=${j}&perPage=10`, { waitUntil: 'networkidle2' });

      const links = await page.evaluate(() => {
        const recentTitles = Array.from(document.querySelectorAll('.recent-title')).map(el => el.closest('a')?.href).filter(Boolean);
        const additionalLinks = Array.from(document.querySelectorAll('dt > a')).map(el => el.getAttribute('href')).filter(href => href && href.startsWith('/data/')).map(href => `https://www.data.go.kr${href}`);
        return [...recentTitles, ...additionalLinks];
      });

      for (const link of links) {
        await saveCrawledUrl(link);
        console.log(`URL 저장 완료: ${link}`);
      }
    } catch (error) {
      console.error(`페이지 ${j} 처리 중 오류 발생:`, error.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

async function saveCrawledUrl(url) {
  try {
    const repository = ApiUrlRepository;
    const newApiUrl = repository.create({ CrawledUrl: url });
    await repository.save(newApiUrl);
  } catch (error) {
    console.error(`URL 저장 중 오류 발생: ${url}, 오류: ${error.message}`);
  }
}

crawlAndSaveUrls().then(() => console.log('크롤링 및 저장 완료')).catch(console.error);

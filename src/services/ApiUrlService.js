const puppeteer = require('puppeteer');
const AppDataSource = require('../data-source');
const ApiUrl = require('../entities/ApiUrl');
const ApiUrlRepository =  require('../repositories/ApiUrlRepository');


const urlPatterns = [
  'http://apis.data.go.kr',
  'https://openapi',
  'http://openapi.onbid.co.kr',
];

async function crawlAndExtractUrls() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  for (let j = 1; j < 1173; j++) {
    console.log(`현재 페이지: ${j}`);

    await page.goto(
      `https://www.data.go.kr/tcs/dss/selectDataSetList.do?dType=API&currentPage=${j}&perPage=10`,
      { waitUntil: 'networkidle2' }
    );

    const links = await page.evaluate(() => {
      const recentTitles = Array.from(document.querySelectorAll('.recent-title')).map((el) => {
        const parentLink = el.closest('a');
        return parentLink ? parentLink.href : null;
      });

      const additionalLinks = Array.from(document.querySelectorAll('dt > a')).map((el) => {
        const href = el.getAttribute('href');
        if (href && href.startsWith('/data/')) {
          return `https://www.data.go.kr${href}`;
        }
        return null;
      });

      return [...recentTitles, ...additionalLinks].filter((href) => href);
    });

    if (!links.length) {
      console.log('링크를 찾을 수 없습니다.');
      continue;
    }

    console.log(`총 ${links.length}개의 링크를 찾았습니다.`);

    for (const link of links) {
      const newPage = await browser.newPage();
      try {
        const response = await newPage.goto(link, { waitUntil: 'networkidle2' });
        if (!response || !response.ok()) {
          console.log(`페이지를 로드할 수 없습니다: ${link}`);
          continue;
        }

        const foundUrls = await newPage.evaluate((urlPatterns) => {
          const urls = [];
          const matchesPattern = (url) => {
            return urlPatterns.some((pattern) => url.startsWith(pattern));
          };

          const baseURL = window.location.origin;

          const listItems = document.querySelectorAll('.dot-list li');
          listItems.forEach((li) => {
            const strongTag = li.querySelector('strong');
            if (strongTag && strongTag.textContent.trim() === '요청주소') {
              const serviceUrl = li.textContent.replace('요청주소', '').trim();
              const fullUrl = serviceUrl.startsWith('http') ? serviceUrl : `${baseURL}${serviceUrl}`;
              if (matchesPattern(fullUrl)) urls.push(fullUrl);
            }
          });

          const tableLinks = document.querySelectorAll('tr.bg-skyblue a');
          tableLinks.forEach((a) => {
            const href = a.getAttribute('href');
            const fullUrl = href.startsWith('http') ? href : `${baseURL}${href}`;
            if (matchesPattern(fullUrl)) urls.push(fullUrl);
          });

          const generalLinks = document.querySelectorAll('a[href]');
          generalLinks.forEach((a) => {
            const href = a.getAttribute('href');
            const fullUrl = href.startsWith('http') ? href : `${baseURL}${href}`;
            if (matchesPattern(fullUrl) && !urls.includes(fullUrl)) {
              urls.push(fullUrl);
            }
          });

          return urls;
        }, urlPatterns);


        if (foundUrls.length > 0) {
          console.log(`총 ${foundUrls.length}개의 URL 추출됨:`);
          for (const url of foundUrls) {
            console.log(`- ${url}`);

            // const apiUrlEntity = new ApiUrl();

            const ApiUrl = url;

            console.log("여기 로그1",ApiUrl);
            apiUrlEntity.crawledUrl = ApiUrl;

            // await apiUrlRepository.save(apiUrlEntity);

            await ApiUrlRepository.save(ApiUrl); 
          }
        } else {
          console.log('패턴에 맞는 URL을 찾을 수 없습니다.');
        }
      } catch (error) {
        console.log(`에러 발생: ${error.message}`);
      } finally {
        await newPage.close();
      }
    }

    console.log(`페이지 ${j}의 모든 링크 처리 완료.`);
  }

  console.log(`모든 페이지 처리 완료. 결과가 데이터베이스에 저장되었습니다.`);
  await browser.close();
}

crawlAndExtractUrls();

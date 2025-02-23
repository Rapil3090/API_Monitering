const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 유효한 URL로 변경
    const targetURL = 'https://www.freepublicapis.com/tags/all'; // 크롤링하려는 실제 URL로 교체
    await page.goto(targetURL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 모든 href 속성 값 추출
    const baseUrl = 'https://www.freepublicapis.com';
    const hrefs = await page.$$eval('a[href]', elements =>
      elements.map(el => el.getAttribute('href'))
    );

    // 앞에 baseUrl 붙이기
    const fullUrls = hrefs.map(href => {
      if (href.startsWith('http') || href.startsWith('//')) {
        return href; // 이미 절대 경로인 경우 그대로 사용
      }
      return `${baseUrl}${href}`; // 상대 경로인 경우 baseUrl 추가
    });

    // 결과를 txt 파일로 저장
    fs.writeFileSync('hrefs.txt', fullUrls.join('\n'), 'utf-8');
    console.log('페이지의 모든 href 데이터를 hrefs.txt에 저장했습니다.');
  } catch (error) {
    console.error('에러 발생:', error.message);
  } finally {
    await browser.close();
  }
})();

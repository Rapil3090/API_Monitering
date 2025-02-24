const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  // Puppeteer 브라우저 실행
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // REST API 데이터 가져오기
  const apiUrl = 'https://restcountries.com/v3.1/all';
  await page.goto(apiUrl, { waitUntil: 'networkidle2' });

  // 페이지의 JSON 데이터 추출
  const countriesData = await page.evaluate(() => JSON.parse(document.body.innerText));

  // 두 가지 형식의 URL 생성
  const urlsBasic = []; // https://restcountries.com/v3.1/name/${commonName}
  const urlsFullText = []; // https://restcountries.com/v3.1/name/${commonName}?fullText=true

  countriesData.forEach(country => {
    const commonName = country?.name?.common;
    if (commonName) {
      urlsBasic.push(`https://restcountries.com/v3.1/name/${commonName}`);
      urlsFullText.push(`https://restcountries.com/v3.1/name/${commonName}?fullText=true`);
    }
  });

  // 결과를 텍스트 파일로 저장
  const outputFileBasic = './crawling/country_urls_basic.txt';
  const outputFileFullText = './crawling/country_urls_fulltext.txt';

  fs.writeFileSync(outputFileBasic, urlsBasic.join('\n'), 'utf-8');
  fs.writeFileSync(outputFileFullText, urlsFullText.join('\n'), 'utf-8');

  console.log(`${urlsBasic.length}개의 기본 URL이 ${outputFileBasic}에 저장되었습니다.`);
  console.log(`${urlsFullText.length}개의 fullText URL이 ${outputFileFullText}에 저장되었습니다.`);

  // 브라우저 종료
  await browser.close();
})();

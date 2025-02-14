const puppeteer = require('puppeteer');
const fs = require('fs'); // 파일 시스템 모듈

(async () => {
  // 브라우저 실행
  const browser = await puppeteer.launch({ headless: true }); // headless 모드로 실행
  const page = await browser.newPage();

  // 결과를 저장할 배열
  const allLinks = [];

  // 페이지 순회
  for (let j = 1; j <= 1172; j++) { // 페이지 범위 설정
    console.log(`현재 페이지: ${j}`);

    // 타겟 웹페이지로 이동
    await page.goto(`https://data.wa.gov/browse?category=&sortBy=relevance&page=${j}&pageSize=20`, { waitUntil: 'domcontentloaded' });

    // 특정 <a> 태그 선택 및 데이터 추출
    const linkSelector = 'a.entry-name-link[data-testid="view-card-entry-link"]'; // <a> 태그의 CSS 선택자
    await page.waitForSelector(linkSelector); // 요소가 로드될 때까지 대기

    const linksOnPage = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector); // 선택자에 해당하는 모든 요소 가져오기
      return Array.from(elements).map((element) => element.href); // href 속성 값만 추출
    }, linkSelector);

    console.log(`페이지 ${j}에서 ${linksOnPage.length}개의 링크를 추출했습니다.`);


    // 결과를 텍스트 파일로 저장
    const fileContent = allLinks.join('\n'); // 줄바꿈으로 각 링크 구분
    fs.writeFileSync('./crawling/data-wa-gov.txt', fileContent, 'utf-8'); // links.txt 파일에 저장


    // 추출된 링크를 결과 배열에 추가
    allLinks.push(...linksOnPage);
  }

  // 브라우저 종료
  await browser.close();

  

  console.log('모든 링크 주소가 data-wa-gov.txt 파일에 저장되었습니다.');
})();

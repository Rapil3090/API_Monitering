const puppeteer = require('puppeteer');
const fs = require('fs'); // 파일 시스템 모듈

(async () => {
  // 브라우저 실행
  const browser = await puppeteer.launch({ headless: true }); // headless 모드로 실행
  const page = await browser.newPage();

  // 결과를 저장할 파일 경로
  const filePath = './crawling/lacity.txt';

  // 기존 파일 초기화 (덮어쓰기)
  fs.writeFileSync(filePath, '', 'utf-8');

  // 페이지 순회
  for (let j = 1; j <=20000; j++) { // 페이지 범위 설정
    console.log(`현재 페이지: ${j}`);

    // 타겟 웹페이지로 이동
    try {
      await page.goto(`https://data.lacity.org/browse?q=&sortBy=relevance&page=${j}&pageSize=20`, { waitUntil: 'domcontentloaded' });
    } catch (error) {
      console.log(`페이지 ${j} 로딩 실패: ${error.message}`);
      continue;
    }

    // 특정 <a> 태그 선택 및 데이터 추출
    const linkSelector = 'a.entry-name-link[data-testid="view-card-entry-link"]'; // <a> 태그의 CSS 선택자
    try {
      await page.waitForSelector(linkSelector, { timeout: 10000 }); // 요소가 로드될 때까지 대기 (최대 10초)
    } catch (error) {
      console.log(`페이지 ${j}에서 링크를 찾지 못했습니다: ${error.message}`);
      continue;
    }

    const linksOnPage = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector); // 선택자에 해당하는 모든 요소 가져오기
      return Array.from(elements).map((element) => element.href); // href 속성 값만 추출
    }, linkSelector);

    console.log(`페이지 ${j}에서 ${linksOnPage.length}개의 링크를 추출했습니다.`);

    // 각 링크 방문 및 API 엔드포인트 추출
    for (const link of linksOnPage) {
      console.log(`데이터셋 페이지 방문: ${link}`);
      try {
        await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 10000 }); // 최대 10초 동안 로딩 대기
      } catch (error) {
        console.log(`페이지 로딩 실패 ${link}: ${error.message}`);
        continue;
      }

      try {
        // 첫 번째 버튼 클릭 (Export 버튼)
        const exportButtonSelector = 'forge-button[data-testid="export-data-button"] button.forge-button';
        const exportButtonExists = await page.$(exportButtonSelector);

        if (!exportButtonExists) {
          console.log('Export 버튼이 존재하지 않습니다. 다음으로 넘어갑니다.');
          continue; // 다음 링크로 넘어감
        }

        // 타임아웃 처리된 클릭
        await Promise.race([
          page.click(exportButtonSelector),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Export 버튼 클릭 타임아웃')), 10000)) // 타임아웃 처리
        ]);

        // 두 번째 버튼 클릭 (API endpoint 토글 버튼)
        const apiToggleButtonSelector = 'forge-button-toggle[data-testid="export-toggle-api"]';
        await Promise.race([
          page.waitForSelector(apiToggleButtonSelector, { timeout: 10000 }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('API 토글 버튼 대기 타임아웃')), 10000))
        ]);
        await Promise.race([
          page.click(apiToggleButtonSelector),
          new Promise((_, reject) => setTimeout(() => reject(new Error('API 토글 버튼 클릭 타임아웃')), 10000))
        ]);

        // API 엔드포인트 추출
        const apiInputSelector = 'input#api-endpoint';
        await Promise.race([
          page.waitForSelector(apiInputSelector, { timeout: 10000 }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('API 엔드포인트 필드 대기 타임아웃')), 10000))
        ]);

        const apiEndpoint = await page.$eval(apiInputSelector, (input) => input.value);

        console.log(`API 엔드포인트 발견: ${apiEndpoint}`);
        
        // API 엔드포인트를 파일에 저장 (추가 모드)
        fs.appendFileSync(filePath, `${apiEndpoint}\n`, 'utf-8');
      } catch (error) {
        console.log(`에러 발생(페이지 건너뜀): ${error.message}`);
        continue; // 에러 발생 시 다음 링크로 넘어감
      }
    }
  }

  console.log(`모든 API 엔드포인트가 ${filePath} 파일에 저장되었습니다.`);

  // 브라우저 종료
  await browser.close();
})();

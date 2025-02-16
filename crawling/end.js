const puppeteer = require('puppeteer');
const fs = require('fs'); // 파일 시스템 모듈

// 랜덤 대기 시간 함수
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  let browser = await puppeteer.launch({ headless: false }); // 브라우저 실행 (headless 모드 비활성화)
  let page = await browser.newPage();

  // 결과를 저장할 파일 경로
  const filePath = './crawling/end.txt';
  fs.writeFileSync(filePath, '', 'utf-8'); // 기존 파일 초기화

  // 시작 페이지 URL
  const startPageURL = 'https://catalog.data.gov/dataset/?q=&sort=views_recent+desc';

  for (let j = 1; j <= 20000; j++) { // 페이지 범위 설정
    console.log(`현재 페이지: ${j}`);

    try {
      // 일정 주기마다 브라우저 재시작
      if (j % 50 === 0) { // 50페이지마다 브라우저 재시작
        console.log('브라우저 재시작...');
        await browser.close();
        browser = await puppeteer.launch({ headless: false });
        page = await browser.newPage();
      }

      // 페이지 이동
      try {
        await page.goto(`${startPageURL}&page=${j}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
      } catch (error) {
        console.log(`페이지 로딩 실패: ${error.message}`);
        continue; // 다음 페이지로 이동
      }

      // 데이터셋 링크 추출
      const datasetLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('h3.dataset-heading > a'));
        return links.map(link => link.href);
      });

      console.log(`페이지 ${j}에서 ${datasetLinks.length}개의 데이터셋 링크를 추출했습니다.`);

      for (const datasetLink of datasetLinks) {
        const absoluteDatasetLink = new URL(datasetLink, 'https://catalog.data.gov').href;
        console.log(`데이터셋 페이지 방문: ${absoluteDatasetLink}`);

        const randomWaitTime = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000; // 5초 ~ 15초 랜덤 대기 시간
        console.log(`랜덤 대기 중... ${randomWaitTime / 1000}초`);
        
        // 랜덤 대기 시간 적용
        await wait(randomWaitTime);

        try {
          await page.goto(absoluteDatasetLink, { waitUntil: 'domcontentloaded', timeout: 20000 });

          // "Visit page" 버튼 확인 및 클릭
          const visitPageSelector = 'div.btn-group > a.btn.btn-primary[target="_blank"]';
          const visitPageExists = await page.$(visitPageSelector);

          if (!visitPageExists) {
            console.log('"Visit page" 버튼이 없습니다. 다음 항목으로 넘어갑니다.');
            continue; // 다음 데이터셋으로 이동
          }

          const visitPageURL = await page.$eval(visitPageSelector, el => el.href);
          console.log(`"Visit page" 버튼 발견. URL: ${visitPageURL}`);

          try {
            await page.goto(visitPageURL, { waitUntil: 'domcontentloaded', timeout: 20000 });

            // "Export" 버튼 확인 및 클릭
            const exportButtonSelector = 'button.forge-button.forge-button--outlined';
            const exportButtonExists = await page.$(exportButtonSelector);

            if (!exportButtonExists) {
              console.log('"Export" 버튼이 없습니다. 다음 항목으로 넘어갑니다.');
              continue; // 다음 데이터셋으로 이동
            }

            console.log('"Export" 버튼 발견. 클릭 중...');
            await page.click(exportButtonSelector);

            // "API endpoint" 버튼 대기 및 클릭
            const apiToggleButtonSelector =
              'forge-button-toggle[data-testid="export-toggle-api"][value="api_endpoint"]';
            const apiToggleButtonExists = await page.$(apiToggleButtonSelector);

            if (!apiToggleButtonExists) {
              console.log('"API endpoint" 버튼이 없습니다. 다음 항목으로 넘어갑니다.');
              continue; // 다음 데이터셋으로 이동
            }

            console.log('"API endpoint" 버튼 발견. 클릭 중...');
            await page.click(apiToggleButtonSelector);

            // API 엔드포인트 추출
            const apiInputSelector = 'input#api-endpoint';
            const apiEndpointExists = await page.$(apiInputSelector);

            if (!apiEndpointExists) {
              console.log('"API endpoint" 입력 필드를 찾을 수 없습니다. 다음 항목으로 넘어갑니다.');
              continue; // 다음 데이터셋으로 이동
            }

            const apiEndpoint = await page.$eval(apiInputSelector, input => input.value);
            console.log(`API 엔드포인트 발견: ${apiEndpoint}`);
            fs.appendFileSync(filePath, `${apiEndpoint}\n`, 'utf-8');

          } catch (error) {
            console.log(`"Visit page" 내부 처리 중 에러 발생: ${error.message}`);
          }
        } catch (error) {
          console.log(`데이터셋 페이지 처리 중 에러 발생: ${error.message}`);
        }
        
      }
    } catch (error) {
      console.log(`페이지 로딩 실패 또는 에러 발생: ${error.message}`);
    }
  }

  console.log(`모든 API 엔드포인트가 ${filePath} 파일에 저장되었습니다.`);
  await browser.close();
})();

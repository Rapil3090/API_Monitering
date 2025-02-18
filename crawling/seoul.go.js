const puppeteer = require('puppeteer');

(async () => {
  // Puppeteer 브라우저 실행
  const browser = await puppeteer.launch({ headless: true }); // headless: false로 설정하면 브라우저가 열립니다.
  const page = await browser.newPage();

  // 서울 데이터 포털 URL로 이동
  const targetURL = 'https://data.seoul.go.kr/dataList/datasetList.do';
  await page.goto(targetURL, { waitUntil: 'networkidle2' });

  const results = []; // 샘플 URL을 저장할 배열

  // 페이지네이션 처리
  let hasNextPage = true;
  while (hasNextPage) {
    console.log(`현재 페이지에서 OpenAPI 버튼 클릭 및 데이터 수집 중...`);

    // 현재 페이지의 모든 OpenAPI 버튼 찾기
    const openApiButtons = await page.$$(
      'button.btn-data-2[data-rel]' // OpenAPI 버튼의 셀렉터
    );

    for (let i = 0; i < openApiButtons.length; i++) {
      // OpenAPI 버튼 클릭
      await openApiButtons[i].click();
      await page.waitForTimeout(1000); // 페이지 로드 대기

      // 샘플 URL 추출
      const sampleUrl = await page.evaluate(() => {
        const linkElement = document.querySelector('a[href*="http://openapi.seoul.go.kr"]');
        return linkElement ? linkElement.href : null;
      });

      if (sampleUrl) {
        results.push(sampleUrl);
        console.log(`추출된 URL: ${sampleUrl}`);
      }

      // 이전 페이지로 돌아가기
      await page.goBack({ waitUntil: 'networkidle2' });
    }

    // 다음 페이지 버튼 클릭 여부 확인
    const nextPageButton = await page.$('button.paging-next:not([disabled])');
    if (nextPageButton) {
      await nextPageButton.click();
      await page.waitForTimeout(1000); // 다음 페이지 로드 대기
    } else {
      hasNextPage = false; // 더 이상 다음 페이지가 없으면 종료
    }
  }

  console.log('모든 샘플 URL 추출 완료:', results);

  // 브라우저 종료
  await browser.close();
})();

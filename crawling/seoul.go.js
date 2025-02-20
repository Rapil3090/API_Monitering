const puppeteer = require('puppeteer');
const fs = require('fs'); // 파일 시스템 모듈

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const baseUrl = 'https://data.seoul.go.kr/dataList/datasetList.do';
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

    const datasetUrlsFile = 'dataset_urls.txt'; // 데이터셋 URL 저장 파일
    const openApiUrlsFile = 'openapi_urls.txt'; // OpenAPI URL 저장 파일
    const failedUrlsFile = 'failed_urls.txt'; // 실패한 URL 저장 파일

    // 기존 파일 초기화
    fs.writeFileSync(datasetUrlsFile, '', 'utf-8');
    fs.writeFileSync(openApiUrlsFile, '', 'utf-8');
    fs.writeFileSync(failedUrlsFile, '', 'utf-8');

    // 데이터셋 URL 추출 함수
    async function extractDatasetUrls() {
        const urlsOnPage = await page.$$eval('.btn-data-2', buttons =>
            buttons.map(button => button.getAttribute('data-rel'))
        );

        for (const url of urlsOnPage) {
            if (url) {
                const fullUrl = `https://data.seoul.go.kr/dataList/${url}`;
                fs.appendFileSync(datasetUrlsFile, fullUrl + '\n', 'utf-8'); // 데이터 저장
                console.log(`추출된 데이터셋 URL: ${fullUrl}`);
            }
        }
    }

    console.log('페이지 1 처리 중...');
    await extractDatasetUrls();

    for (let i = 2; i <= 555; i++) {
        console.log(`페이지 ${i}로 이동 중...`);

        try {
            if (i % 10 === 1 && i !== 1) {
                // "다음" 버튼 클릭 처리
                const nextButton = await page.$('.paging-next');
                if (nextButton) {
                    await Promise.all([
                        nextButton.click(),
                        page.waitForNavigation({ waitUntil: 'networkidle0' }) // 페이지 로드 대기
                    ]);
                } else {
                    console.error(`"다음" 버튼을 찾을 수 없습니다. 페이지 ${i}로 이동 실패.`);
                    break;
                }
            } else {
                // 일반 페이지 번호 클릭 처리
                const pageButton = await page.$(`.paging-num[onclick="fn_board_page(${i}); return false;"]`);
                if (pageButton) {
                    await Promise.all([
                        page.evaluate(button => button.click(), pageButton),
                        page.waitForNavigation({ waitUntil: 'networkidle0' }) // 페이지 로드 대기
                    ]);
                } else {
                    console.error(`페이지 ${i} 버튼을 찾을 수 없습니다.`);
                    break;
                }
            }

            await extractDatasetUrls(); // 데이터 추출
        } catch (error) {
            console.error(`페이지 ${i} 처리 중 오류 발생:`, error);
        }
    }

    console.log('데이터셋 URL 수집 완료.');

    const datasetUrls = fs.readFileSync(datasetUrlsFile, 'utf-8').split('\n').filter(Boolean);

    for (const datasetUrl of datasetUrls) {
        try {
            console.log(`페이지 이동 중: ${datasetUrl}`);
            await page.goto(datasetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 }); // 페이지 로드 대기

            // OpenAPI 링크가 나타날 때까지 대기
            await page.waitForSelector('a[target="ifr1"]', { timeout: 5000 });

            const apiUrl = await page.$eval('a[target="ifr1"]', link => link.href);
            fs.appendFileSync(openApiUrlsFile, apiUrl + '\n', 'utf-8'); // OpenAPI URL 저장
            console.log(`추출된 OpenAPI URL: ${apiUrl}`);
        } catch (error) {
            console.error(`OpenAPI URL 추출 실패: ${datasetUrl}`);
            fs.appendFileSync(failedUrlsFile, datasetUrl + '\n', 'utf-8'); // 실패한 URL 저장
        }
    }

    console.log('OpenAPI URL 수집 완료.');

    await browser.close();
})();

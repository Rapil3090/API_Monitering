const puppeteer = require('puppeteer');
const fs = require('fs'); // 파일 시스템 모듈

(async () => {
    let browser;
    const datasetUrlsFile = './crawling/dataset_urls.txt'; // 데이터셋 URL 저장 파일
    const openApiUrlsFile = './crawling/openapi_urls.txt'; // OpenAPI URL 저장 파일
    const failedUrlsFile = './crawling/failed_urls.txt'; // 실패한 URL 저장 파일

    // 기존 파일 초기화
    fs.writeFileSync(openApiUrlsFile, '', 'utf-8');
    fs.writeFileSync(failedUrlsFile, '', 'utf-8');

    // 브라우저 재시작 타이머 설정 (5분)
    const RESTART_INTERVAL = 5 * 60 * 1000; // 5분 (밀리초)
    let lastRestartTime = Date.now();

    async function restartBrowser() {
        if (browser) {
            console.log('브라우저를 종료합니다...');
            await browser.close();
        }
        console.log('브라우저를 다시 시작합니다...');
        browser = await puppeteer.launch({ headless: false });
        return browser;
    }

    async function safeGoto(page, url, retries = 3) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                return; // 성공 시 함수 종료
            } catch (error) {
                console.error(`페이지 이동 실패 (시도 ${attempt}/${retries}): ${url}, 에러: ${error.message}`);
                if (attempt === retries) throw error; // 마지막 시도에서도 실패하면 에러 던짐
            }
        }
    }

    async function processDatasetUrls(datasetUrls) {
        let page = await browser.newPage();

        for (const datasetUrl of datasetUrls) {
            try {
                // 일정 시간마다 브라우저 재시작
                if (Date.now() - lastRestartTime > RESTART_INTERVAL) {
                    console.log('브라우저 재시작 타이머 경과. 브라우저를 재시작합니다.');
                    await page.close();
                    browser = await restartBrowser();
                    page = await browser.newPage(); // 새 페이지 생성
                    lastRestartTime = Date.now();
                }

                console.log(`페이지 이동 중: ${datasetUrl}`);
                
                // 안전한 페이지 이동
                await safeGoto(page, datasetUrl);

                // OpenAPI 링크 대기 및 추출
                await page.waitForSelector('a[target="ifr1"]', { timeout: 10000 });
                const apiUrl = await page.$eval('a[target="ifr1"]', link => link.href);

                fs.appendFileSync(openApiUrlsFile, apiUrl + '\n', 'utf-8'); // OpenAPI URL 저장
                console.log(`추출된 OpenAPI URL: ${apiUrl}`);
            } catch (error) {
                console.error(`OpenAPI URL 추출 실패: ${datasetUrl}, 에러 메시지: ${error.message}`);
                
                // 디버깅용 HTML 저장
                try {
                    const html = await page.content();
                    fs.writeFileSync('./debug.html', html, 'utf-8');
                    console.log('HTML 스냅샷 저장 완료');
                } catch (snapshotError) {
                    console.error('HTML 스냅샷 저장 중 오류:', snapshotError.message);
                }

                fs.appendFileSync(failedUrlsFile, datasetUrl + '\n', 'utf-8'); // 실패한 URL 저장
            }
        }

        await page.close();
    }

    try {
        browser = await restartBrowser(); // 초기 브라우저 실행

        // dataset_urls.txt에서 데이터셋 URL 읽기
        const datasetUrls = fs.readFileSync(datasetUrlsFile, 'utf-8').split('\n').filter(Boolean);

        if (datasetUrls.length === 0) {
            console.log('dataset_urls.txt에 데이터셋 URL이 없습니다.');
            return;
        }

        console.log(`총 ${datasetUrls.length}개의 데이터셋 URL 처리 시작...`);
        await processDatasetUrls(datasetUrls);
    } catch (error) {
        console.error('스크립트 실행 중 오류 발생:', error.message);
    } finally {
        if (browser) {
            console.log('브라우저를 종료합니다...');
            await browser.close();
        }
    }
})();

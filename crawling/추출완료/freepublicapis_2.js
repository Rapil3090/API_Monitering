const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // 입력 파일과 출력 파일 경로 설정
  const inputFilePath = path.join(__dirname, 'hrefs.txt'); // URL 리스트가 저장된 텍스트 파일
  const outputFilePath = path.join(__dirname, 'extracted_urls.txt'); // 추출된 주소를 저장할 파일

  try {
    // 입력 파일 읽기
    const urls = fs.readFileSync(inputFilePath, 'utf-8').split('\n').filter(Boolean);

    // 추출된 주소를 저장할 배열
    const extractedUrls = [];

    for (const url of urls) {
      try {
        console.log(`접속 중: ${url}`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // div에서 주소 추출
        const extractedUrl = await page.$eval(
          'div.p-4.my-4.w-full.rounded-xl.bg-white.border-2.border-orange-500.shadow-sm.text-primary-900.outline-none.overflow-x-auto.text-xs.md\\:text-base',
          el => el.textContent.trim()
        );

        console.log(`추출된 URL: ${extractedUrl}`);
        extractedUrls.push(extractedUrl);
      } catch (error) {
        console.log(`주소를 찾을 수 없음: ${url}`);
        continue; // 다음 URL로 넘어가기
      }
    }

    // 결과를 텍스트 파일로 저장
    fs.writeFileSync(outputFilePath, extractedUrls.join('\n'), 'utf-8');
    console.log(`추출된 주소가 ${outputFilePath}에 저장되었습니다.`);
  } catch (error) {
    console.error('스크립트 실행 중 에러 발생:', error.message);
  } finally {
    await browser.close();
  }
})();

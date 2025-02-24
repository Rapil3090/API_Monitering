const puppeteer = require('puppeteer');
const fs = require('fs');

const urls = [
    "https://jsonplaceholder.typicode.com/posts",
    "https://jsonplaceholder.typicode.com/comments",
    "https://jsonplaceholder.typicode.com/albums",
    "https://jsonplaceholder.typicode.com/photos",
    "https://jsonplaceholder.typicode.com/todos",
    "https://jsonplaceholder.typicode.com/users"
];

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let allData = []; // 전체 데이터를 저장할 배열

    for (const url of urls) {
        console.log(`Fetching data from: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        // 페이지의 JSON 데이터를 파싱
        const data = await page.evaluate(() => JSON.parse(document.body.innerText));

        // 각 데이터의 id를 기반으로 새로운 URL 생성
        const newUrls = data.map(item => {
            if (item.id) {
                return `${url}/${item.id}`;
            }
            return null;
        }).filter(Boolean); // null 값 제거

        // 결과를 저장
        allData.push(...newUrls);
    }

    // 결과를 텍스트 파일로 저장
    const filePath = './crawling/jsonplaceholder.txt';
    fs.writeFileSync(filePath, allData.join('\n'));
    console.log(`Data saved to ${filePath}`);

    await browser.close();
})();

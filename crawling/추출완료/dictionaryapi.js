const puppeteer = require('puppeteer');
const axios = require('axios'); // HTTP 요청을 위해 axios 사용
const fs = require('fs');

(async () => {
  try {
    // Puppeteer 브라우저 실행
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // 1. 랜덤 단어 API 호출
    const randomWordApiUrl = 'https://random-word-api.herokuapp.com/word?number=60000';
    console.log('랜덤 단어 API 호출 중...');
    const randomWordsResponse = await axios.get(randomWordApiUrl);
    const randomWords = randomWordsResponse.data; // 응답 데이터는 배열 형태

    console.log(`총 ${randomWords.length}개의 단어를 가져왔습니다.`);

    // 2. 각 단어로 Dictionary API URL 생성
    const dictionaryApiBaseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
    const dictionaryUrls = []; // 모든 URL을 저장할 배열

    for (let i = 0; i < randomWords.length; i++) {
      const word = randomWords[i];
      const dictionaryApiUrl = `${dictionaryApiBaseUrl}${word}`;
      dictionaryUrls.push(dictionaryApiUrl); // 배열에 URL 추가

      console.log(`단어 ${i + 1}/${randomWords.length}: ${word} - ${dictionaryApiUrl}`);

    
    }

    // 3. 파일에 저장
    const filePath = './crawling/randomWord.txt';
    fs.writeFileSync(filePath, dictionaryUrls.join('\n')); // 배열을 줄바꿈으로 연결하여 저장
    console.log(`모든 URL이 ${filePath}에 저장되었습니다.`);

    // Puppeteer 브라우저 닫기
    await browser.close();
  } catch (error) {
    console.error(`스크립트 실행 중 오류 발생: ${error.message}`);
  }
})();

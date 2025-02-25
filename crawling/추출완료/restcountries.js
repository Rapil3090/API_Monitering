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

  const restcountriesUrls = [];

  // countriesData.forEach(country => {
  //   const commonName = country?.name?.common;
  //   if (commonName) {
  //     urlsBasic.push(`https://restcountries.com/v3.1/name/${commonName}`);
  //     urlsFullText.push(`https://restcountries.com/v3.1/name/${commonName}?fullText=true`);
  //   }
  // });

  countriesData.forEach(countriesList => {
    const alphaName = countriesList?.cca2;
    const alphaName2 = countriesList?.ccn3;
    const alphaName3 = countriesList?.cca3;
    const alphaName4 = countriesList?.cioc;

    const currencies = countriesList?.currencies ? Object.keys(countriesList.currencies)[0] : null;

    const demonym = countriesList?.demonyms?.eng
      ? (countriesList.demonyms.eng.f === countriesList.demonyms.eng.m
          ? countriesList.demonyms.eng.f
          : `${countriesList.demonyms.eng.f}, ${countriesList.demonyms.eng.m}`)
      : null;

    const language = countriesList?.languages ? Object.values(countriesList.languages)[0] : null;
    const capital = countriesList?.capital;
    const region = countriesList?.region;
    const subregion = countriesList?.subregion;

    
    if (countriesList?.translations) {
      Object.entries(countriesList.translations).forEach(([key, value]) => {
          const commonName = value.common;
          if (commonName) {
            restcountriesUrls.push(`https://restcountries.com/v3.1/translation/${commonName}`);
          }
      });
    }



    if (alphaName) restcountriesUrls.push(`https://restcountries.com/v3.1/alpha/${alphaName}`);
    if (alphaName2) restcountriesUrls.push(`https://restcountries.com/v3.1/alpha/${alphaName2}`);
    if (alphaName3) restcountriesUrls.push(`https://restcountries.com/v3.1/alpha/${alphaName3}`);
    if (alphaName4) restcountriesUrls.push(`https://restcountries.com/v3.1/alpha/${alphaName4}`);
    if (currencies) restcountriesUrls.push(`https://restcountries.com/v3.1/currency/${currencies}`);
    if (demonym) restcountriesUrls.push(`https://restcountries.com/v3.1/demonym/${demonym}`);
    if (language) restcountriesUrls.push(`https://restcountries.com/v3.1/lang/${language}`);
    if (capital) restcountriesUrls.push(`https://restcountries.com/v3.1/capital/${capital}`);
    if (region) restcountriesUrls.push(`https://restcountries.com/v3.1/region/${region}`);
    if (subregion) restcountriesUrls.push(`https://restcountries.com/v3.1/subregion/${subregion}`);
    


  });

  const uniqueUrls = [...new Set(restcountriesUrls)]

  const code = './crawling/code.txt';

  fs.writeFileSync(code, restcountriesUrls.join('\n'), 'utf-8');

  await browser.close();
})();

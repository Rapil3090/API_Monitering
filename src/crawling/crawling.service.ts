import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CrawlingService {
  private browser: puppeteer.Browser;
  private readonly datasetUrlsFile = './crawling/dataset_urls.txt';
  private readonly openApiUrlsFile = './crawling/openapi_urls.txt';
  private readonly failedUrlsFile = './crawling/failed_urls.txt';
  private readonly extractedUrlsFile = './crawling/extracted_urls.txt';
  private readonly hrefsFile = './crawling/hrefs.txt';
  private readonly RESTART_INTERVAL = 1 * 60 * 1000;
  private lastRestartTime = Date.now();
  
  constructor(
    
  ) {
    fs.writeFileSync(this.openApiUrlsFile, ``, `utf-8`);
    fs.writeFileSync(this.failedUrlsFile, ``, `utf-8`);
    fs.writeFileSync(this.datasetUrlsFile, '', 'utf-8');
    fs.writeFileSync(this.extractedUrlsFile, '', 'utf-8');
    fs.writeFileSync(this.hrefsFile, '', 'utf-8');
  }

  private async restartBrowser(): Promise<puppeteer.Browser> {
    if (this.browser) {
      console.log(`브라우저 종료`);
      await this.browser.close();
    }
    console.log(`브라우저 다시 시작`);
    this.browser = await puppeteer.launch({ headless: false });
    return this.browser;
  };

  private async safeGoto(page: puppeteer.Page, url: string, retries = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000});
        return;
      } catch (error) {
        console.error(`페이지 이동 실패 ${attempt}/${retries}`);
        if (attempt === retries) throw error;
      }
    }
  };

  private async extractSeoulDatasetUrls(): Promise<void> {
    const baseUrl = 'https://data.seoul.go.kr/dataList/datasetList.do';

    try {
      this.browser = await this.restartBrowser();
      const page = await this.browser.newPage();

      console.log(`Base URL로 페이지 이동 중: ${baseUrl}`);
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

      console.log(`이동완료`);

      const extractDatasetUrls = async () => {
        const urlsOnPage = await page.$$eval('.btn-data-2', (buttons) =>
          buttons.map((button) => button.getAttribute('data-rel')),
        );
        console.log(`페이지에서 추출중`);

        for (const url of urlsOnPage) {
          if (url) {
            const fullUrl = `https://data.seoul.go.kr/dataList/${url}`;
            fs.appendFileSync(this.datasetUrlsFile, fullUrl + '\n', 'utf-8');
            console.log(`추출된 데이터셋 URL: ${fullUrl}`);
          }
        }
      };

      console.log('페이지 1 처리 중...');
      await extractDatasetUrls();

      for (let i = 2; i <= 803; i++) {
        console.log(`페이지 ${i}로 이동 중...`);

        try {
          if (i % 10 === 1 && i !== 1) {
            const nextButton = await page.$('.paging-next');
            if (nextButton) {
              await Promise.all([
                nextButton.click(),
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
              ]);
            } else {
              console.error(`"다음" 버튼을 찾을 수 없습니다. 페이지 ${i}로 이동 실패.`);
              break;
            }
          } else {
            const pageButton = await page.$(
              `.paging-num[onclick="fn_board_page(${i}); return false;"]`,
            );
            if (pageButton) {
              await Promise.all([
                page.evaluate((button) => (button as HTMLElement).click(), pageButton),
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
              ]);
            } else {
              console.error(`페이지 ${i} 버튼을 찾을 수 없습니다.`);
              break;
            }
          
          }

          await extractDatasetUrls();
        } catch (error) {
          console.error(`페이지 ${i} 처리 중 오류 발생:`, error);
        }
      }

      console.log('데이터셋 URL 수집 완료.');
    } catch (error) {
      console.error('데이터셋 URL 추출 중 오류 발생:', error.message);
    }
  }

  private async processSeoulOpenApiUrls(): Promise<void> {
    const datasetUrls = fs.readFileSync(this.datasetUrlsFile, `utf-8`).split(`\n`).filter(Boolean);
    
    if (datasetUrls.length === 0) {
      console.log(`텍스트파일에 url이 없습니다.`);
      return;
    }

    let page = await this.browser.newPage();

    for(const datasetUrl of datasetUrls) {
      try {
        if(Date.now() - this.lastRestartTime > this.RESTART_INTERVAL) {
          console.log(`브라우저 재시작`);
          await page.close();
          this.browser = await this.restartBrowser();
          page = await this.browser.newPage();
          this.lastRestartTime = Date.now();
        }

        await this.safeGoto(page, datasetUrl);

        await page.waitForSelector('a[target="ifr1"]', {timeout: 10000});
        const apiUrl = await page.$eval('a[target="ifr1"]', (link) => link.href);

        fs.appendFileSync(this.openApiUrlsFile, apiUrl + `\n`, `utf-8`);

      } catch (error) {
        console.error(`추출실패 : ${datasetUrl}, 에러 메시지: ${error.message}` );
        fs.appendFileSync(this.failedUrlsFile, datasetUrl + `\n`, `utf-8`);
      }
    }

    await page.close();
  };


  private async extractAllData(): Promise<void> {
    try {
      const targetURL = 'https://www.freepublicapis.com/tags/all';
      const outputFilePath = './crawling/extracted_results.txt';
      const baseUrl = new URL(targetURL).origin;
  
      const page = await this.browser.newPage();
  
      console.log(`페이지 이동 중: ${targetURL}`);
      await page.goto(targetURL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  
      const hrefs = await page.$$eval('a[href]', elements =>
        elements.map(el => el.getAttribute('href')),
      );
  
      const fullUrls = hrefs.map(href => {
        if (!href) return '';
        if (href.startsWith('http') || href.startsWith('//')) {
          return href.startsWith('//') ? `https:${href}` : href;
        }
        return `${baseUrl}${href.startsWith('/') ? '' : '/'}${href}`;
      }).filter(Boolean);
  
      console.log(`추출된 href 개수: ${fullUrls.length}`);
  
      const extractedResults: string[] = [];
  
      for (const url of fullUrls) {
        try {
          console.log(`접속 중: ${url}`);
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  
          const extractedContent = await page.$eval(
            'div.p-4.my-4.w-full.rounded-xl.bg-white.border-2.border-orange-500.shadow-sm.text-primary-900.outline-none.overflow-x-auto.text-xs.md\\:text-base',
            el => el.textContent.trim()
          );
  
          console.log(`추출된 내용: ${extractedContent}`);
          extractedResults.push(`URL: ${url}\n내용: ${extractedContent}\n`);
        } catch (error) {
          console.log(`주소를 찾을 수 없음 또는 div를 찾을 수 없음: ${url}`);
          continue;
        }
      }
  
      fs.writeFileSync(outputFilePath, extractedResults.join('\n'), 'utf-8');
      console.log(`모든 데이터가 ${outputFilePath}에 저장되었습니다.`);
  
      await page.close();
    } catch (error) {
      console.error('스크립트 실행 중 에러 발생:', error.message);
    }
  }
  


  public async startCrawling(): Promise<void> {
    try {
      this.browser = await this.restartBrowser();
      
      await this.extractSeoulDatasetUrls();
      await this.processSeoulOpenApiUrls();

      this.browser = await this.restartBrowser();

      await this.extractAllData();

      this.browser = await this.restartBrowser();




    } catch (error) {
      if (this.browser) {
        console.log(`브라우저를 종료합니다`);
        await this.browser.close();
      }
    }
  };


  

}

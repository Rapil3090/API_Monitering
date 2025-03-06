import { Injectable } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import { ApiEndpoint } from 'src/api-endpoint/entities/api-endpoint.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiEndpointRepository } from 'src/api-endpoint/repository/api-endpoint.repository';
import { Url } from 'src/api-endpoint/entities/url.entity';
import { UrlRepository } from 'src/api-endpoint/repository/url.repository';

@Injectable()
export class CrawlingService {
  private browser: puppeteer.Browser;
  private readonly RESTART_INTERVAL = 10 * 60 * 1000;
  private lastRestartTime = Date.now();
  
  constructor(
    @InjectRepository(ApiEndpoint)
    private readonly apiEndpointRepository: ApiEndpointRepository,
    @InjectRepository(Url)
    private readonly urlRepository: UrlRepository,
  ) { }

  private async restartBrowser(): Promise<puppeteer.Browser> {
    console.log(`리스타트 진입`);

    if (this.browser) {
        console.log(`브라우저 재시작`);
        try {
            await this.browser.close();
            console.log(`브라우저 정상적으로 닫힘`);
        } catch (error) {
            console.error(`브라우저 닫기 중 오류 발생: ${error.message}`);
        }
    }

    try {
        console.log(`새로운 브라우저 인스턴스 생성 중...`);
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: '/usr/bin/chromium-browser',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
            ],
        });
        console.log(`브라우저 인스턴스 생성 완료`);
        return browser;
    } catch (error) {
        console.error(`브라우저 생성 중 오류 발생: ${error.message}`);
        throw error;
    }
}

  private async safeGoto(page: puppeteer.Page, url: string): Promise<void> {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 100000 });
    } catch (error) {
      console.error(`페이지 이동 실패: ${url}, 에러 메시지: ${error.message}`);
    }
  }


  private async extractSeoulDatasetUrls(): Promise<string[]> {
    const baseUrl = 'https://data.seoul.go.kr/dataList/datasetList.do';
    const datasetUrls : string[] = [];
    console.log(`열린 크롤링 시작`);

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
            
            datasetUrls.push(fullUrl);

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

    return datasetUrls;
  };

  private async processSeoulOpenApiUrls(datasetUrls: string[]): Promise<void> {
    
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

        await page.waitForSelector('a[target="ifr1"]', {timeout: 100000});
        const apiUrl = await page.$eval('a[target="ifr1"]', (link) => link.href);

        const existingUrl = await this.urlRepository.findOne({
          where: {
            url: apiUrl,
          }
        });

        if (!existingUrl) {
          await this.urlRepository.save({
            url: apiUrl,
          })
        };

      } catch (error) {
        console.error(`추출실패 : ${datasetUrl}, 에러 메시지: ${error.message}` );
      }
    }

    await page.close();
  };


  private async extractAllData(): Promise<void> {
    try {
      const targetURL = 'https://www.freepublicapis.com/tags/all';
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

          const existingUrl = await this.urlRepository.findOne({
            where: {
              url: extractedContent,
            }
          });
    
          if (!existingUrl) {
            await this.urlRepository.save({
              url: extractedContent,
            })
          };

        } catch (error) {
          console.log(`주소를 찾을 수 없음 또는 div를 찾을 수 없음: ${url}`);
          continue;
        }
      }
  
      await page.close();
    } catch (error) {
      console.error('스크립트 실행 중 에러 발생:', error.message);
    }
  };
  
  private async crawlPokeArticles1(): Promise<void> {
    const urls = [
    "https://pokeapi.co/api/v2/ability/?limit=10000",
    "https://pokeapi.co/api/v2/evolution-chain?limit=10000",
    "https://pokeapi.co/api/v2/berry?limit=10000",
    "https://pokeapi.co/api/v2/berry-firmness?limit=10000",
    "https://pokeapi.co/api/v2/berry-flavor?limit=10000",
    "https://pokeapi.co/api/v2/contest-type?limit=10000",
    "https://pokeapi.co/api/v2/contest-effect?limit=10000",
    "https://pokeapi.co/api/v2/super-contest-effect?limit=10000",
    "https://pokeapi.co/api/v2/encounter-method?limit=10000",
    "https://pokeapi.co/api/v2/encounter-condition?limit=10000",
    "https://pokeapi.co/api/v2/encounter-condition-value?limit=10000",
    "https://pokeapi.co/api/v2/evolution-chain?limit=10000",
    "https://pokeapi.co/api/v2/evolution-trigger?limit=10000",
    "https://pokeapi.co/api/v2/generation?limit=10000",
    "https://pokeapi.co/api/v2/pokedex?limit=10000",
    "https://pokeapi.co/api/v2/version?limit=10000",
    "https://pokeapi.co/api/v2/version-group?limit=10000",
    "https://pokeapi.co/api/v2/item?limit=10000",
    "https://pokeapi.co/api/v2/item-attribute?limit=10000",
    "https://pokeapi.co/api/v2/item-category?limit=10000",
    "https://pokeapi.co/api/v2/item-fling-effect?limit=10000",
    "https://pokeapi.co/api/v2/item-pocket?limit=10000",
    "https://pokeapi.co/api/v2/location?limit=10000",
    "https://pokeapi.co/api/v2/location-area?limit=10000",
    "https://pokeapi.co/api/v2/pal-park-area?limit=10000",
    "https://pokeapi.co/api/v2/region?limit=10000",
    "https://pokeapi.co/api/v2/machine?limit=10000",
    "https://pokeapi.co/api/v2/move?limit=10000",
    "https://pokeapi.co/api/v2/move-ailment?limit=10000",
    "https://pokeapi.co/api/v2/move-battle-style?limit=10000",
    "https://pokeapi.co/api/v2/move-category?limit=10000",
    "https://pokeapi.co/api/v2/move-damage-class?limit=10000",
    "https://pokeapi.co/api/v2/move-learn-method?limit=10000",
    "https://pokeapi.co/api/v2/move-target?limit=10000",
    "https://pokeapi.co/api/v2/ability?limit=10000",
    "https://pokeapi.co/api/v2/characteristic?limit=10000",
    "https://pokeapi.co/api/v2/egg-group?limit=10000",
    "https://pokeapi.co/api/v2/gender?limit=10000",
    "https://pokeapi.co/api/v2/growth-rate?limit=10000",
    "https://pokeapi.co/api/v2/nature?limit=10000",
    "https://pokeapi.co/api/v2/pokeathlon-stat?limit=10000",
    "https://pokeapi.co/api/v2/pokemon?limit=10000",
    "https://pokeapi.co/api/v2/pokemon-color?limit=10000",
    "https://pokeapi.co/api/v2/pokemon-form?limit=10000",
    "https://pokeapi.co/api/v2/pokemon-habitat?limit=10000",
    "https://pokeapi.co/api/v2/pokemon-shape?limit=10000",
    "https://pokeapi.co/api/v2/pokemon-species?limit=10000",
    "https://pokeapi.co/api/v2/stat?limit=10000",
    "https://pokeapi.co/api/v2/type?limit=10000",
    "https://pokeapi.co/api/v2/language?limit=10000",
    ];

    const finalData: string[] = [];

    for (const url of urls) {
      console.log("url", url);
      const response = await axios.get(url);
      if (response.data.results) {
        for (const result of response.data.results) {
          if (result.url) {
            console.log("result.url", result.url);

            const existingUrl = await this.urlRepository.findOne({
              where: {
                url: result.url,
              }
            });
      
            if (!existingUrl) {
              await this.urlRepository.save({
                url: result.url,
              })
            };

          } else {
            console.log("result.url 가 없음 in", url);
          }
        }
      } else {
        console.log("response.data.results 가 없음 in", url);
      }
    }

    console.log(`poke 크롤링 종료`);
  };

  private async crawlPokeArticles2(): Promise<void> {
    const baseUrl = "https://pokeapi.co/api/v2/pokemon?limit=10000";

    try {
      const response = await axios.get(baseUrl);
      const results = response.data.results;

      if (results) {
        for (const result of results) {
          if (result.url) {
            const idMatch = result.url.match(/\/pokemon\/(\d+)\//);
            if (idMatch && idMatch[1]) {
              const pokemonId = idMatch[1];
              const encounterUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters`;
              console.log(`Generated URL: ${encounterUrl}`);

              const existingUrl = await this.urlRepository.findOne({
                where: {
                  url: encounterUrl,
                }
              });
        
              if (!existingUrl) {
                await this.urlRepository.save({
                  url: encounterUrl,
                })
              };

            } else {
              console.log(`ID 추출 실패: ${result.url}`);
            }
          } else {
            console.log("result.url이 없음");
          }
        }
      } else {
        console.log("response.data.results가 없음");
      }

      console.log(`Encounter URL이 종료`);
    } catch (error) {
      console.error("Error during crawling:", error.message);
    }
  };

  private async crawlJsonPlaceholder(): Promise<void> {
    const urls = [
      'https://jsonplaceholder.typicode.com/posts',
      'https://jsonplaceholder.typicode.com/comments',
      'https://jsonplaceholder.typicode.com/albums',
      'https://jsonplaceholder.typicode.com/photos',
      'https://jsonplaceholder.typicode.com/todos',
      'https://jsonplaceholder.typicode.com/users',
    ];

    try {
      this.browser = await this.restartBrowser();
      const page = await this.browser.newPage();

      for (const url of urls) {
        console.log(`Fetching data from: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        const data = await page.evaluate(() => JSON.parse(document.body.innerText));

        const newUrls = data.map((item) => {
          if (item.id) {
            return `${url}/${item.id}`;
          }
          return null;
        }).filter(Boolean);

        const existingUrl = await this.urlRepository.findOne({
          where: {
            url: newUrls,
          }
        });
  
        if (!existingUrl) {
          await this.urlRepository.save({
            url: newUrls,
          })
        };
        

      }

      console.log(`JSONPlaceholder 종료되었습니다`);
    } catch (error) {
      console.error('JSONPlaceholder 크롤링 중 오류 발생:', error.message);
    } finally {
      if (this.browser) {
        console.log('브라우저 종료 중...');
        await this.browser.close();
      }
    }
  };


  public async crawlRestCountries(): Promise<void> {
    const apiUrl = 'https://restcountries.com/v3.1/all';
    const restcountriesUrls: string[] = [];

    try {
      this.browser = await this.restartBrowser();
      const page = await this.browser.newPage();

      console.log(`Fetching data from: ${apiUrl}`);
      await page.goto(apiUrl, { waitUntil: 'networkidle2' });

      const countriesData = (await page.evaluate(() => JSON.parse(document.body.innerText))) as Array<{
        name?: { common?: string };
        cca2?: string;
        ccn3?: string;
        cca3?: string;
        cioc?: string;
        currencies?: Record<string, unknown>;
        demonyms?: { eng?: { f: string; m: string } };
        languages?: Record<string, string>;
        capital?: string[];
        region?: string;
        subregion?: string;
        translations?: Record<string, { common: string }>;
      }>;

      countriesData.forEach((country) => {
        const commonName = country?.name?.common;
        if (commonName) {
          restcountriesUrls.push(`https://restcountries.com/v3.1/name/${commonName}`);
          restcountriesUrls.push(`https://restcountries.com/v3.1/name/${commonName}?fullText=true`);
        }
      });

      countriesData.forEach((countriesList) => {
        const alphaName = countriesList?.cca2;
        const alphaName2 = countriesList?.ccn3;
        const alphaName3 = countriesList?.cca3;
        const alphaName4 = countriesList?.cioc;

        const currencies = countriesList?.currencies ? Object.keys(countriesList.currencies)[0] : null;

        const demonym = countriesList?.demonyms?.eng
          ? countriesList.demonyms.eng.f === countriesList.demonyms.eng.m
            ? countriesList.demonyms.eng.f
            : `${countriesList.demonyms.eng.f}, ${countriesList.demonyms.eng.m}`
          : null;

        const language = countriesList?.languages ? Object.values(countriesList.languages)[0] : null;
        const capital = countriesList?.capital;
        const region = countriesList?.region;
        const subregion = countriesList?.subregion;

        if (countriesList?.translations) {
          Object.entries(countriesList.translations).forEach(([key, value]) => {
            const translationCommonName = value.common;
            if (translationCommonName) {
              restcountriesUrls.push(
                `https://restcountries.com/v3.1/translation/${translationCommonName}`,
              );
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

      const uniqueUrls = [...new Set(restcountriesUrls)];
      for(const url of uniqueUrls) {

        const existingUrl = await this.urlRepository.findOne({
          where: {
            url,
          }
        });
  
        if (!existingUrl) {
          await this.urlRepository.save({
            url,
          })
        };
      }
      
      console.log(`REST Countries 종료되었습니다.`);
    } catch (error) {
      console.error('REST Countries 크롤링 중 오류 발생:', error);
    } finally {
      if (this.browser) {
        console.log('브라우저 종료 중...');
        await this.browser.close();
      }
    }
  };

  private async fetchRandomWords(): Promise<void> {
    const randomWordApiUrl = 'https://random-word-api.herokuapp.com/word?number=60000';

    try {
      console.log('랜덤 단어 API 호출 중...');
      const response = await axios.get(randomWordApiUrl);
      const randomWords: string[] = response.data;

      console.log(`총 ${randomWords.length}개의 단어를 가져왔습니다.`);

      const dictionaryApiBaseUrl = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
      const dictionaryUrls = randomWords.map((word) => `${dictionaryApiBaseUrl}${word}`);


      for(const url of dictionaryUrls) {

        const existingUrl = await this.urlRepository.findOne({
          where: {
            url,
          }
        });
  
        if (!existingUrl) {
          await this.urlRepository.save({
            url,
          })
        };
      };

      console.log(`모든 URL이 종료되었습니다.`);
    } catch (error) {
      console.error(`랜덤 단어 API 호출 중 오류 발생: ${error.message}`);
    }
  };

  

  public async startCrawling(): Promise<void> {
    try {
        const startTime = Date.now();

        console.log(`크롤링 준비`);

        this.browser = await this.restartBrowser();
        console.log(`[0ms] 브라우저 재시작 완료`);

        let methodStartTime = Date.now();
        const datasetUrls = await this.extractSeoulDatasetUrls();
        console.log(`[${Date.now() - startTime}ms] extractSeoulDatasetUrls 완료 (소요 시간: ${Date.now() - methodStartTime}ms)`);

        methodStartTime = Date.now();
        await this.processSeoulOpenApiUrls(datasetUrls);
        console.log(`[${Date.now() - startTime}ms] processSeoulOpenApiUrls 완료 (소요 시간: ${Date.now() - methodStartTime}ms)`);

        methodStartTime = Date.now();
        await this.extractAllData();
        console.log(`[${Date.now() - startTime}ms] extractAllData 완료 (소요 시간: ${Date.now() - methodStartTime}ms)`);

        methodStartTime = Date.now();
        await this.crawlPokeArticles1();
        console.log(`[${Date.now() - startTime}ms] crawlPokeArticles1 완료 (소요 시간: ${Date.now() - methodStartTime}ms)`);

        methodStartTime = Date.now();
        await this.crawlPokeArticles2();
        console.log(`[${Date.now() - startTime}ms] crawlPokeArticles2 완료 (소요 시간: ${Date.now() - methodStartTime}ms)`);

        methodStartTime = Date.now();
        await this.crawlJsonPlaceholder();
        console.log(`[${Date.now() - startTime}ms] crawlJsonPlaceholder 완료 (소요 시간: ${Date.now() - methodStartTime}ms)`);

        methodStartTime = Date.now();
        await this.crawlRestCountries();
        console.log(`[${Date.now() - startTime}ms] crawlRestCountries 완료 (소요 시간: ${Date.now() - methodStartTime}ms)`);

        methodStartTime = Date.now();
        await this.fetchRandomWords();
        console.log(`[${Date.now() - startTime}ms] fetchRandomWords 완료 (소요 시간: ${Date.now() - methodStartTime}ms)`);

    } catch (error) {
        if (this.browser) {
            console.log(`브라우저를 종료합니다`);
            await this.browser.close();
        }
    }
  };

  public async pokeCrawling1() {

    await this.crawlPokeArticles1();

  };

  public async pokeCrawling2() {

    await this.crawlPokeArticles2();

  };


  

}

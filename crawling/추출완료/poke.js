const axios = require("axios");
const { log } = require("console");
const fs = require("fs");

async function crawlPokeArticles1() {
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
    // "https://pokeapi.co/api/v2/pokemon//encounters?limit=10000",
    "https://pokeapi.co/api/v2/pokemon-color?limit=10000",
    "https://pokeapi.co/api/v2/pokemon-form?limit=10000",
    "https://pokeapi.co/api/v2/pokemon-habitat?limit=10000",
    "https://pokeapi.co/api/v2/pokemon-shape?limit=10000",
    "https://pokeapi.co/api/v2/pokemon-species?limit=10000",
    "https://pokeapi.co/api/v2/stat?limit=10000",
    "https://pokeapi.co/api/v2/type?limit=10000",
    "https://pokeapi.co/api/v2/language?limit=10000",
  ];

  const finalData = [];

  for (const url of urls) {
    console.log("url", url);
    const response = await axios.get(url);
    // await sleep(1000);
    if (response.data.results) {
      for (const result of response.data.results) {
        if (result.url) {
          console.log("result.url", result.url);
          finalData.push(result.url);
        } else {
          console.log("result.url 가 없음 in", url);
        }
      }
    } else {
      console.log("response.data.results 가 없음 in", url);
    }
  }
    const filePath = './crawling/poke.txt';
    fs.appendFileSync(filePath, finalData.join('\n') + '\n', 'utf-8');
  return "Done";
}

crawlPokeArticles1()
  .then((articles) => {
    // console.log("Total articles:", articles.length);
    // console.log("Total articles:", articles);
    // fs.writeFileSync("articles.json", JSON.stringify(articles));
    // articleList를 전부 저장한 후에 원하는 작업을 수행할 수 있습니다.
  })
  .catch((error) => console.error("Error:", error));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function crawlPokeArticles2() {
    const baseUrl = "https://pokeapi.co/api/v2/pokemon?limit=10000";
    const finalData = [];
  
    try {
      // 1. 기본 URL에서 Pokémon 데이터를 가져오기
      const response = await axios.get(baseUrl);
      const results = response.data.results;
      const filePath = "./crawling/poke_encounters.txt";
  
      if (results) {
        for (const result of results) {
          if (result.url) {
            // 2. Pokémon URL에서 ID 추출
            const idMatch = result.url.match(/\/pokemon\/(\d+)\//);
            if (idMatch && idMatch[1]) {
              const pokemonId = idMatch[1];
              console.log(`Extracted ID: ${pokemonId}`);
  
              // 3. ID를 사용해 새로운 URL 생성
              const encounterUrl = `https://pokeapi.co/api/v2/pokemon/${pokemonId}/encounters?limit=10000`;
              console.log(`Generated URL: ${encounterUrl}`);
  
              fs.appendFileSync(filePath, encounterUrl + '\n', 'utf-8');
              // 4. 새 URL에서 데이터 가져오기
              // const encounterResponse = await axios.get(encounterUrl);
              finalData.push(encounterUrl);
  
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
  
      console.log(`데이터가 ${filePath}에 저장되었습니다.`);
    } catch (error) {
      console.error("Error during crawling:", error);
    }
  
    return "Done";
  }


  crawlPokeArticles2()
  .then((articles) => {
    // console.log("Total articles:", articles.length);
    // console.log("Total articles:", articles);
    // fs.writeFileSync("articles.json", JSON.stringify(articles));
    // articleList를 전부 저장한 후에 원하는 작업을 수행할 수 있습니다.
  })
  .catch((error) => console.error("Error:", error));
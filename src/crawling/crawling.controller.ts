import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CrawlingService } from './crawling.service';
import { CreateCrawlingDto } from './dto/create-crawling.dto';
import { UpdateCrawlingDto } from './dto/update-crawling.dto';

@Controller('crawling')
export class CrawlingController {
  constructor(private readonly crawlingService: CrawlingService) {}



  @Get()
  findAll() {
    return this.crawlingService.startCrawling();
  }

  @Get('poke1')
  poke1() {
    return this.crawlingService.pokeCrawling1();
  };

  @Get('poke2')
  poke2() {
    return this.crawlingService.pokeCrawling2();
  };

  

}

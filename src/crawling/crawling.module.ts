import { Module } from '@nestjs/common';
import { CrawlingService } from './crawling.service';
import { CrawlingController } from './crawling.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiEndpoint } from 'src/api-endpoint/entities/api-endpoint.entity';
import { ApiEndpointRepository } from 'src/api-endpoint/repository/api-endpoint.repository';
import { UrlRepository } from 'src/api-endpoint/repository/url.repository';
import { Url } from 'src/api-endpoint/entities/url.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiEndpoint,
      Url,
    ]),
  ],
  controllers: [CrawlingController],
  providers: [
    CrawlingService,
    ApiEndpointRepository,
    UrlRepository,
  ],
})
export class CrawlingModule {}

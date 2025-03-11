import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiEndpointModule } from './api-endpoint/api-endpoint.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiEndpoint } from './api-endpoint/entities/api-endpoint.entity';
import { ApiResponseModule } from './api-response/api-response.module';
import { ApiResponse } from './api-response/entities/api-response.entity';
import { CronjobModule } from './cronjob/cronjob.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HeaderQuery } from './api-endpoint/entities/header-query.entity';
import { Parameter } from './api-endpoint/entities/parameter.entity';
import { RequestCount } from './api-endpoint/entities/request-count.entity';
import { ServiceKey } from './api-endpoint/entities/servicekey.entity';
import { Url } from './api-endpoint/entities/url.entity';
import { RequestInterval } from './api-response/entities/request-interval.entity';
import { ResponseBody } from './api-response/entities/response-body.entity';
import { ResponseTime } from './api-response/entities/response-time.entity';
import { StatusCode } from './api-response/entities/status-code.entity';
import { SuccessStatus } from './api-response/entities/success-status.entity';
import { CrawlingModule } from './crawling/crawling.module';
import { HealthCheckModule } from './health-check/health-check.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().required(),
        DB_TYPE: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required()
      })
    }),
    TypeOrmModule.forRootAsync({
      useFactory:(configService: ConfigService) => ({
        type: configService.get<string>('DB_TYPE') as 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          ApiEndpoint,
          ApiResponse,
          HeaderQuery,
          Parameter,
          RequestCount,
          ServiceKey,
          Url,
          RequestInterval,
          ResponseBody,
          ResponseTime,
          StatusCode,
          SuccessStatus,
        ],
        synchronize: true,
      }),
      inject: [ConfigService]
    }),
    ScheduleModule.forRoot(),
    ApiEndpointModule,
    ApiResponseModule,
    CronjobModule,
    CrawlingModule,
    HealthCheckModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ApiEndpointService } from './api-endpoint.service';
import { ApiEndpointController } from './api-endpoint.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiEndpoint } from './entities/api-endpoint.entity';
import { ApiResponse } from 'src/api-response/entities/api-response.entity';
import { Cronjob } from 'src/cronjob/entities/cronjob.entity';
import { CronjobService } from 'src/cronjob/cronjob.service';
import { ApiEndpointRepository } from './repository/api-endpoint.repository';
import { ApiResponseRepository } from 'src/api-response/repository/api-response.repository';
import { Url } from './entities/url.entity';
import { UrlRepository } from './repository/url.repository';
import { RequestInterval } from 'src/api-response/entities/request-interval.entity';
import { StatusCode } from 'src/api-response/entities/status-code.entity';
import { SuccessStatus } from 'src/api-response/entities/success-status.entity';
import { ResponseTime } from 'src/api-response/entities/response-time.entity';
import { ResponseBody } from 'src/api-response/entities/response-body.entity';
import { RequestIntervalRepository } from 'src/api-response/repository/request-interval.repository';
import { SuccessStatusRepository } from 'src/api-response/repository/success-status.repository';
import { ResponseBodyRepository } from 'src/api-response/repository/response-body.repository';
import { ResponseTimeRepository } from 'src/api-response/repository/response-time.repository';import { StatusCodeRepository } from 'src/api-response/repository/status-code.repository';
import { Parameter } from './entities/parameter.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiEndpoint,
      ApiResponse,
      Url,
      Cronjob,
      RequestInterval,
      ResponseBody,
      ResponseTime,
      StatusCode,
      SuccessStatus,
      Parameter,
    ]),
  ],
  controllers: [ApiEndpointController],
  providers: [
    ApiEndpointRepository,
    ApiResponseRepository,
    ApiEndpointService,
    UrlRepository,
    CronjobService,
    RequestIntervalRepository,
    StatusCodeRepository,
    SuccessStatusRepository,
    ResponseBodyRepository,
    ResponseTimeRepository,
    SuccessStatusRepository,
    {
      provide: 'TIMERS_MAP',
      useValue: new Map<number, NodeJS.Timeout>(),
    }
  ],
})
export class ApiEndpointModule {}

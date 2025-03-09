import { Module } from "@nestjs/common";
import { CronjobService } from "./cronjob.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiEndpoint } from "src/api-endpoint/entities/api-endpoint.entity";
import { ApiEndpointService } from "src/api-endpoint/api-endpoint.service";
import { ApiResponseService } from "src/api-response/api-response.service";
import { ApiResponse } from "src/api-response/entities/api-response.entity";
import { Url } from "src/api-endpoint/entities/url.entity";
import { StatusCodeRepository } from "src/api-response/repository/status-code.repository";
import { SuccessStatusRepository } from "src/api-response/repository/success-status.repository";
import { ResponseTimeRepository } from "src/api-response/repository/response-time.repository";
import { ResponseBodyRepository } from "src/api-response/repository/response-body.repository";
import { RequestIntervalRepository } from "src/api-response/repository/request-interval.repository";
import { RequestInterval } from "src/api-response/entities/request-interval.entity";
import { ResponseBody } from "src/api-response/entities/response-body.entity";
import { ResponseTime } from "src/api-response/entities/response-time.entity";
import { SuccessStatus } from "src/api-response/entities/success-status.entity";  
import { StatusCode } from "src/api-response/entities/status-code.entity";
import { Parameter } from "src/api-endpoint/entities/parameter.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiEndpoint,
      ApiResponse,
      Url,
      RequestInterval,
      ResponseBody,
      ResponseTime,
      StatusCode,
      SuccessStatus,
      Parameter,
    ]),
  ],
  providers: [
    CronjobService,
    ApiEndpointService,
    ApiResponseService,
    {
      provide: 'TIMERS_MAP',
      useValue: new Map<number, NodeJS.Timeout>(),
    }
  ],
  exports: [CronjobService],
})
export class CronjobModule {}

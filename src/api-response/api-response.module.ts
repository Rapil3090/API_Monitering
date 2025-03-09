import { Module } from '@nestjs/common';
import { ApiResponseService } from './api-response.service';
import { ApiResponseController } from './api-response.controller';
import { ApiResponseRepository } from './repository/api-response.repository';
import { RequestInterval } from './entities/request-interval.entity';
import { RequestIntervalRepository } from './repository/request-interval.repository';
import { ResponseBodyRepository } from './repository/response-body.repository';
import { ResponseTime } from './entities/response-time.entity';
import { ResponseTimeRepository } from './repository/response-time.repository';
import { StatusCodeRepository } from './repository/status-code.repository';
import { SuccessStatusRepository } from './repository/success-status.repository';

@Module({
  controllers: [ApiResponseController],
  providers: [
    ApiResponseRepository,
    ApiResponseService,
    RequestIntervalRepository,
    ResponseBodyRepository,
    ResponseTimeRepository,
    StatusCodeRepository,
    SuccessStatusRepository,
  ],
})
export class ApiResponseModule {}

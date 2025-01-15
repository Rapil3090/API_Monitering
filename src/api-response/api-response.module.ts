import { Module } from '@nestjs/common';
import { ApiResponseService } from './api-response.service';
import { ApiResponseController } from './api-response.controller';
import { ApiResponseRepository } from './repository/api-response.repository';

@Module({
  controllers: [ApiResponseController],
  providers: [
    ApiResponseRepository,
    ApiResponseService
  ],
})
export class ApiResponseModule {}

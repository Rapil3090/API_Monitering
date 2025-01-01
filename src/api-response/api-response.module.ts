import { Module } from '@nestjs/common';
import { ApiResponseService } from './api-response.service';
import { ApiResponseController } from './api-response.controller';

@Module({
  controllers: [ApiResponseController],
  providers: [ApiResponseService],
})
export class ApiResponseModule {}

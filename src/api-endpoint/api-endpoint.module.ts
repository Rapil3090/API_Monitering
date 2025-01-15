import { Module } from '@nestjs/common';
import { ApiEndpointService } from './api-endpoint.service';
import { ApiEndpointController } from './api-endpoint.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiEndpoint } from './entities/api-endpoint.entity';
import { ApiResponse } from 'src/api-response/entities/api-response.entity';
import { Cronjob } from 'src/cronjob/entities/cronjob.entity';
import { CronjobService } from 'src/cronjob/cronjob.service';
import { ApiEndpointRepository } from './repository/api-endpoint.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiEndpoint,
      ApiResponse,
      Cronjob,
    ])
  ],
  controllers: [ApiEndpointController],
  providers: [
    ApiEndpointRepository,
    ApiEndpointService,
    CronjobService,
    {
      provide: 'TIMERS_MAP',
      useValue: new Map<number, NodeJS.Timeout>(),
    }
  ],
})
export class ApiEndpointModule {}

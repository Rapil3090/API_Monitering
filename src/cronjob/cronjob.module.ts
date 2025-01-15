import { Module } from "@nestjs/common";
import { CronjobService } from "./cronjob.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ApiEndpoint } from "src/api-endpoint/entities/api-endpoint.entity";
import { ApiEndpointService } from "src/api-endpoint/api-endpoint.service";
import { ApiResponseService } from "src/api-response/api-response.service";
import { ApiResponse } from "src/api-response/entities/api-response.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiEndpoint,
      ApiResponse,
    ])
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

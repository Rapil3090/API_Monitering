import { Module } from '@nestjs/common';
import { ApiEndpointService } from './api-endpoint.service';
import { ApiEndpointController } from './api-endpoint.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiEndpoint } from './entities/api-endpoint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ApiEndpoint,
    ])
  ],
  controllers: [ApiEndpointController],
  providers: [ApiEndpointService],
})
export class ApiEndpointModule {}

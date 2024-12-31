import { Test, TestingModule } from '@nestjs/testing';
import { ApiEndpointController } from './api-endpoint.controller';
import { ApiEndpointService } from './api-endpoint.service';

describe('ApiEndpointController', () => {
  let controller: ApiEndpointController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiEndpointController],
      providers: [ApiEndpointService],
    }).compile();

    controller = module.get<ApiEndpointController>(ApiEndpointController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

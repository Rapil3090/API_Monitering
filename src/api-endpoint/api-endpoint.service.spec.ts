import { Test, TestingModule } from '@nestjs/testing';
import { ApiEndpointService } from './api-endpoint.service';

describe('ApiEndpointService', () => {
  let service: ApiEndpointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiEndpointService],
    }).compile();

    service = module.get<ApiEndpointService>(ApiEndpointService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponseController } from './api-response.controller';
import { ApiResponseService } from './api-response.service';

describe('ApiResponseController', () => {
  let controller: ApiResponseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiResponseController],
      providers: [ApiResponseService],
    }).compile();

    controller = module.get<ApiResponseController>(ApiResponseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

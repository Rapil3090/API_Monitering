import { Test, TestingModule } from '@nestjs/testing';
import { ApiEndpointService } from './api-endpoint.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiEndpoint } from './entities/api-endpoint.entity';
import { ApiResponse } from 'src/api-response/entities/api-response.entity';
import { CreateApiEndpointDto } from './dto/create-api-endpoint.dto';
import { async } from 'rxjs';
import { BadRequestException } from '@nestjs/common';

const mockApiEndpointRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  save: jest.fn()
};

const mockApiResponseRepository = {
  save: jest.fn()
};

const mockTimersMap = new Map<number, NodeJS.Timeout>();

describe('ApiEndpointService', () => {
  let apiEndpointService: ApiEndpointService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiEndpointService,
        {
          provide: getRepositoryToken(ApiEndpoint),
          useValue: mockApiEndpointRepository,
        },
        {
          provide: getRepositoryToken(ApiResponse),
          useValue: mockApiResponseRepository,
        },
        {
          provide: 'TIMERS_MAP',
          useValue: mockTimersMap,
        }
      ],
    }).compile();

    apiEndpointService = module.get<ApiEndpointService>(ApiEndpointService);
  });

  it('should be defined', () => {
    expect(apiEndpointService).toBeDefined();
  });


describe('create', () => {
  it('api 생성', async() => {
    
    const createApiEndpointDto : CreateApiEndpointDto = { 
      url: 'test@test.com',
      parameters: [
        {"type" : "query", "key" : "pageNo", "value" : "1"},
        {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
      ],
      callTime: 5000
    };

    const result = { id: 1, url: createApiEndpointDto.url, parameters: createApiEndpointDto.parameters, callTime: createApiEndpointDto.callTime };

    jest.spyOn(mockApiEndpointRepository, 'findOne')
    .mockResolvedValueOnce(null)
    .mockResolvedValueOnce(result);
    jest.spyOn(mockApiEndpointRepository, 'create').mockResolvedValue(result);
    jest.spyOn(mockApiEndpointRepository, 'save').mockResolvedValue(result);
    jest.spyOn(mockApiEndpointRepository, 'findOne').mockResolvedValue(result);

    const createdApiEndpoint = await apiEndpointService.create(createApiEndpointDto);

    expect(createdApiEndpoint).toEqual(result);
    expect(mockApiEndpointRepository.findOne).toHaveBeenCalledWith({
      where: {
        url: createApiEndpointDto.url,
      }
    });
    expect(mockApiEndpointRepository.create).toHaveBeenCalledWith(createApiEndpointDto);
    expect(mockApiEndpointRepository.save).toHaveBeenCalledWith(result);
  });

  it('이미 저장된 url로 생성요청했을때 실패', async() => {

    const createApiEndpointDto : CreateApiEndpointDto = { 
      url: 'test@test.com',
      parameters: [
        {"type" : "query", "key" : "pageNo", "value" : "1"},
        {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
      ],
      callTime: 5000
    };

    jest.spyOn(mockApiEndpointRepository, 'findOne').mockResolvedValue({
      id: 1,
      url: createApiEndpointDto.url,
      parameters: createApiEndpointDto.parameters,
      callTime: createApiEndpointDto.callTime,
    });

    await expect(apiEndpointService.create(createApiEndpointDto)).rejects.toThrow(BadRequestException);
    await expect(apiEndpointService.create(createApiEndpointDto)).rejects.toThrow(new BadRequestException(`이미 저장된 url입니다. ${createApiEndpointDto.url}`));
    expect(mockApiEndpointRepository.findOne).toHaveBeenCalledWith({
      where: {
        url: createApiEndpointDto.url,
      },
    });
  });

  


})

});

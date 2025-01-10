import { Test, TestingModule } from '@nestjs/testing';
import { ApiEndpointService } from './api-endpoint.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiEndpoint } from './entities/api-endpoint.entity';
import { ApiResponse } from 'src/api-response/entities/api-response.entity';
import { CreateApiEndpointDto } from './dto/create-api-endpoint.dto';
import { async } from 'rxjs';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateApiEndpointDto } from './dto/update-api-endpoint.dto';
import { RequestApiEndpointDto } from './dto/request-api-endpoint.dto';
import axios from 'axios';

const mockApiEndpointRepository = {
  create: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockApiResponseRepository = {
  save: jest.fn()
};

const mockTimersMap = new Map<number, NodeJS.Timeout>();

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

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
    jest.spyOn(mockApiEndpointRepository, 'save').mockResolvedValue(result);
    jest.spyOn(mockApiEndpointRepository, 'findOne').mockResolvedValue(result);

    const createdApiEndpoint = await apiEndpointService.create(createApiEndpointDto);

    expect(createdApiEndpoint).toEqual(result);
    expect(mockApiEndpointRepository.findOne).toHaveBeenCalledWith({
      where: {
        url: createApiEndpointDto.url,
      }
    });
    expect(mockApiEndpointRepository.save).toHaveBeenCalledWith(createApiEndpointDto);
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
  
  it('parameters 미입력시 에러', async() => {

    const createApiEndpointDto : CreateApiEndpointDto = { 
      url: 'test@test.com',
      parameters: null,
      callTime: 5000
    };

    await expect(apiEndpointService.create(createApiEndpointDto))
    .rejects.toThrow(BadRequestException);
  });

  it('callTime 미입력시 에러', async() => {

    const createApiEndpointDto : CreateApiEndpointDto = { 
      url: 'test@test.com',
      parameters: [
        {"type" : "query", "key" : "pageNo", "value" : "1"},
        {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
      ],
      callTime: -1000,
    };

    await expect(apiEndpointService.create(createApiEndpointDto))
    .rejects.toThrow(BadRequestException);
  });

});

describe('getAllEndpoints', () => {
  it('모든 endpoint 조회', async () => {
    
    const endpoints = [
      { id: 1,  
        url: 'test@test.com',
      parameters: [
        {"type" : "query", "key" : "pageNo", "value" : "1"},
        {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
      ],
      callTime: 5000 },
      {
        id: 2,
        url: 'test2@test.com',
        parameters: [
          {"type" : "query", "key" : "pageNo", "value" : "1"},
          {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
        ],
        callTime: 5000
      },
    ];

    jest.spyOn(mockApiEndpointRepository, 'find').mockResolvedValue(endpoints);
    
    const result = await apiEndpointService.getAllEndpoints();

    expect(result).toEqual(endpoints);
    expect(mockApiEndpointRepository.find).toHaveBeenCalled();
  });
});

  describe('findById', () => {
    it('findById', async() => {

      const endpoint = { 
        id: 1,
        url: 'test@test.com',
        parameters: [
          {"type" : "query", "key" : "pageNo", "value" : "1"},
          {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
        ],
        callTime: 5000
      };
      
      jest.spyOn(mockApiEndpointRepository, 'findOne').mockResolvedValue(endpoint);

      const result = await apiEndpointService.findById(1);

      expect(result).toEqual(endpoint);
      expect(result.url).toBe(endpoint.url);
      expect(result.parameters).toHaveLength(2);
      expect(mockApiEndpointRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: 1,
        }
      });
    });

    it('저장되지 않은 id로 조회시 실패', async() => {

      const id = 1;

      jest.spyOn(mockApiEndpointRepository, 'findOne').mockResolvedValue(null);

      await expect(apiEndpointService.findById(1)).rejects.toThrow(NotFoundException);
      expect(mockApiEndpointRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: id,
        }
      });
      await expect(apiEndpointService.findById(1)).rejects.toThrow(
        new NotFoundException(`해당 ${id}이 저장되어 있지 않습니다.`)
      );
    });
  });

  describe('update', () => {
    it('업데이트 성공', async() => {

      const apiEndpoint = { 
        id: 1,
        url: 'test@test.com',
        parameters: [
          {"type" : "query", "key" : "pageNo", "value" : "1"},
          {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
        ],
        callTime: 5000
      };

      const updateApiEndpointDto : UpdateApiEndpointDto = { 
        id: 1,
        url: 'test2@test.com',
        parameters: [
          {"type" : "query", "key" : "pageNo", "value" : "1"},
          {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
        ],
        callTime: 5000
      };

      jest.spyOn(mockApiEndpointRepository, 'findOne')
      .mockResolvedValueOnce(apiEndpoint)
      .mockResolvedValueOnce(updateApiEndpointDto);
      jest.spyOn(mockApiEndpointRepository, 'update').mockResolvedValue(updateApiEndpointDto);
      
      const result = await apiEndpointService.update(updateApiEndpointDto);

      expect(result).toEqual(updateApiEndpointDto);
      expect(mockApiEndpointRepository.findOne)
      .toHaveBeenCalledWith({where: { url: apiEndpoint.url, }});
      expect(mockApiEndpointRepository.update).toHaveBeenCalledWith(
        {id: apiEndpoint.id,}, 
        {url:updateApiEndpointDto.url,
         parameters: updateApiEndpointDto.parameters,
         callTime: updateApiEndpointDto.callTime} );
      expect(mockApiEndpointRepository.findOne).toHaveBeenCalledWith({
        where: {id: apiEndpoint.id},
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('update시 중복된 url이 있을때 실패', async() => {

      const updateRequest = { 
        id: 1,
        url: 'test@test.com',
        parameters: [
          {"type" : "query", "key" : "pageNo", "value" : "1"},
          {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
        ],
        callTime: 5000
      };
      
      const existingApiEndpoint = { 
        id: 2,
        url: 'test@test.com',
        parameters: [
          {"type" : "query", "key" : "pageNo", "value" : "1"},
          {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
        ],
        callTime: 5000
      };

      jest.spyOn(mockApiEndpointRepository, 'findOne').mockResolvedValueOnce(existingApiEndpoint);

      await expect(apiEndpointService.update(updateRequest)).rejects.toThrow(BadRequestException);
      expect(mockApiEndpointRepository.findOne).toHaveBeenCalledWith({ where: { url: updateRequest.url }});
      expect(mockApiEndpointRepository.update).not.toHaveBeenCalled();

    });
  });


  describe('remove', () => {
    it('api 삭제 성공', async() =>{

      const apiEndpoint = { 
        id: 1,
        url: 'test@test.com',
        parameters: [
          {"type" : "query", "key" : "pageNo", "value" : "1"},
          {"type" : "apiKey", "key" : "serviceKey", "value" : "R3fWxDee7P9ysC5ty+6Y7LbJyFTiH0ToWmOtlRCJVUdWYd1kAkDzzTS9RA6Mn8Ikq0GYE1eEu462kax9JgnaNw=="}
        ],
        callTime: 5000
      };
      

      jest.spyOn(mockApiEndpointRepository, 'findOne').mockResolvedValue(apiEndpoint);
      jest.spyOn(mockApiEndpointRepository, 'delete').mockResolvedValue(undefined);
      
      const result = await apiEndpointService.remove(1);

      expect(result).toEqual('ok');
      expect(mockApiEndpointRepository.findOne).toHaveBeenCalledWith({ where: { id:1 }});
      expect(mockApiEndpointRepository.delete).toHaveBeenCalled();

    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('삭제 요청시 id 존재 여부 확인', async() => {

      jest.spyOn(mockApiEndpointRepository, 'findOne').mockResolvedValue(null);

      await expect(apiEndpointService.remove(1)).rejects.toThrow(NotFoundException);
      expect(mockApiEndpointRepository.findOne).toHaveBeenCalledWith({ where: { id: 1,}});
      expect(mockApiEndpointRepository.delete).not.toHaveBeenCalled();

    })
  });
  

  describe('sendApiRequest', () => {
    it('sendApiRequest 요청 성공', async() => {

      const apiEndpointDto: RequestApiEndpointDto = {
        id : 1,
        url: 'test@test.com',
        parameters: [
        {"type" : "query", "key" : "pageNo", "value" : "1"},
      ],
        callTime: 5000,
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: 'Successful response data',
      status: 200,
      });

      const result = await apiEndpointService.sendApiRequest(apiEndpointDto);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        apiEndpointDto.url,
        { params: { pageNo : '1'},
          headers : {},
        },
      );
      
      expect(mockApiResponseRepository.save).toHaveBeenCalledWith({
        responseTime: expect.any(Number),
        body: 'Successful response data'.substring(0, 255),
        statusCode: 200,
        success: true,
      });
    }); 

    it('sendApiRequest query 실패', async() => {

      const apiEndpointDto: RequestApiEndpointDto = {
        id : 1,
        url: 'test@test.com',
        parameters: [
        {"type" : "query", "key" : "pageNo", "value" : "1"},
      ],
        callTime: 5000,
      };

      mockedAxios.get.mockRejectedValue({ response: { status: 500}});

      await apiEndpointService.sendApiRequest(apiEndpointDto);

      expect(mockApiResponseRepository.save).toHaveBeenCalledWith({
        responseTime: expect.any(Number),
        statusCode: 500,
        body: '요청 및 재시도 실패',
        success: false,
      });
    });

    it('sendApiRequest header 실패', async() => {

      const apiEndpointDto: RequestApiEndpointDto = {
        id : 1,
        url: 'test@test.com',
        parameters: [
        {"type" : "header", "key" : "pageNo", "value" : "1"},
      ],
        callTime: 5000,
      };

      mockedAxios.get.mockRejectedValue({ response: { status: 500}});

      await apiEndpointService.sendApiRequest(apiEndpointDto);

      expect(mockApiResponseRepository.save).toHaveBeenCalledWith({
        responseTime: expect.any(Number),
        statusCode: 500,
        body: '요청 및 재시도 실패',
        success: false,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('sendApiRequest 실패시 재시도', async () => {

      const apiEndpointDto: RequestApiEndpointDto = {
        id : 1,
        url: 'test@test.com',
        parameters: [
        {"type" : "header", "key" : "pageNo", "value" : "1"},
      ],
        callTime: 5000,
      };

      mockedAxios.get.mockRejectedValue({response: { status: 500}});

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await apiEndpointService.sendApiRequest(apiEndpointDto);

      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('서버 에러 발생'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining(`최대 재시도 횟수 초과: ${apiEndpointDto.url}`));

      consoleWarnSpy.mockRestore();
      consoleErrorSpy.mockRestore();

    });
  });


});

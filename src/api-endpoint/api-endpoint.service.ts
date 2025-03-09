import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateApiEndpointDto } from "./dto/create-api-endpoint.dto";
import { UpdateApiEndpointDto } from "./dto/update-api-endpoint.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ApiEndpoint } from "./entities/api-endpoint.entity";
import axios, { AxiosResponse } from "axios";
import { ApiResponse } from "src/api-response/entities/api-response.entity";
import { RequestApiEndpointDto } from "./dto/request-api-endpoint.dto";
import { ApiEndpointRepository } from "./repository/api-endpoint.repository";
import { ApiResponseRepository } from "src/api-response/repository/api-response.repository";
import { Url } from "./entities/url.entity";
import { UrlRepository } from "./repository/url.repository";
import { RequestUrlDto } from "./dto/request-url.dto";
import { RequestParameterDto } from "./dto/request-parameter.dto";
import { RequestInterval } from "src/api-response/entities/request-interval.entity";
import { RequestIntervalRepository } from "src/api-response/repository/request-interval.repository";
import { ResponseBody } from "src/api-response/entities/response-body.entity";
import { ResponseBodyRepository } from "src/api-response/repository/response-body.repository";
import { ResponseTime } from "src/api-response/entities/response-time.entity";
import { ResponseTimeRepository } from "src/api-response/repository/response-time.repository";
import { StatusCode } from "src/api-response/entities/status-code.entity";
import { StatusCodeRepository } from "src/api-response/repository/status-code.repository";
import { SuccessStatus } from "src/api-response/entities/success-status.entity";
import { SuccessStatusRepository } from "src/api-response/repository/success-status.repository";
import { log } from "console";
import { Parameter } from "./entities/parameter.entity";
import { ParameterRepository } from "./repository/parameter.repository";

@Injectable()
export class ApiEndpointService {
  constructor(
    @InjectRepository(ApiEndpoint)
    private readonly apiEndpointRepository: ApiEndpointRepository,
    @InjectRepository(ApiResponse)
    private readonly apiResponseRepository: ApiResponseRepository,
    @Inject("TIMERS_MAP") private readonly timers: Map<number, NodeJS.Timeout>,
    @InjectRepository(Url)
    private readonly urlRepository: UrlRepository,
    @InjectRepository(RequestInterval)
    private readonly requestIntervalRepository: RequestIntervalRepository,
    @InjectRepository(ResponseBody)
    private readonly responseBodyRepository: ResponseBodyRepository,
    @InjectRepository(ResponseTime)
    private readonly responseTimeRepository: ResponseTimeRepository,
    @InjectRepository(StatusCode)
    private readonly statusCodeRepository: StatusCodeRepository,
    @InjectRepository(SuccessStatus)
    private readonly successStatusRepository: SuccessStatusRepository,
    @InjectRepository(Parameter)
    private readonly parameterRepository: ParameterRepository,
  ) {}

  async create(createApiEndpointDto: CreateApiEndpointDto) {
    const { url, parameters, callTime } = createApiEndpointDto;

    const existingUrl = await this.apiEndpointRepository.findOne({
      where: {
        url: createApiEndpointDto.url,
      },
    });

    if (existingUrl) {
      throw new BadRequestException(`이미 저장된 url입니다. ${url}`);
    }

    await this.apiEndpointRepository.save(createApiEndpointDto);

    return await this.apiEndpointRepository.findOne({
      where: {
        url,
      },
    });
  }

  async getAllEndpoints() {
    return this.apiEndpointRepository.find();
  }

  async findById(id: number) {
    const existsById = await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    if (!existsById) {
      throw new NotFoundException(`해당 ${id}이 저장되어 있지 않습니다.`);
    }

    return existsById;
  }

  async findByUrlId(id: number) {
    
    return await this.urlRepository.findOne({
      where: {
        id,
      },
    });
  }

  async update(updateApiEndpointDto: UpdateApiEndpointDto) {
    const { id, url, parameters, callTime } = updateApiEndpointDto;

    const existingEndpoint = await this.apiEndpointRepository.findOne({
      where: {
        url,
      },
    });

    if (existingEndpoint && id !== existingEndpoint.id) {
      throw new BadRequestException(`중복된 url : ${url} 입니다.`);
    }

    await this.apiEndpointRepository.update(
      {
        id,
      },
      {
        url,
        parameters,
        callTime,
      }
    );

    const updatedApiEndpoint = await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    return updatedApiEndpoint;
  }

  async remove(id: number) {
    const existsByUrl = await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    if (!existsByUrl) {
      throw new NotFoundException(`해당 ${id}이 저장되어 있지 않습니다.`);
    }

    await this.apiEndpointRepository.delete(id);

    return "ok";
  }

  async sendApiRequest({url, parameters}: {
    url: RequestUrlDto, 
    parameters: RequestParameterDto[]
  }) {
    const retries = 3;
    const currentTime = new Date();

    const urlEntity = await this.urlRepository.findOne({
      where: { id: url.id }
    });

    if (!urlEntity) {
      throw new NotFoundException(`URL을 찾을 수 없습니다: ${url.url}`);
    }

    for (let i = 1; i <= retries; i++) {
      try {
        const queryParams = parameters.reduce((acc: Record<string, string>, param) => {
          if (param.type.toLowerCase() === 'query') {
            acc[param.key] = param.value;
          }
          return acc;
        }, {});

        const headerParams = parameters.reduce((acc: Record<string, string>, param) => {
          if (param.type.toLowerCase() === 'header') {
            acc[param.key] = param.value;
          }
          return acc;
        }, {});

        const response: AxiosResponse = await axios.get(url.url, {
          params: queryParams,
          headers: headerParams,
          timeout: 5000,
          validateStatus: function (status) {
            return status < 600;
          },
        });

        const endTime = new Date();
        const elapsedTime = endTime.getTime() - currentTime.getTime();

        const requestInterval = new RequestInterval();
        requestInterval.intervalTime = elapsedTime;
        requestInterval.url = urlEntity;

        const responseBody = new ResponseBody();
        responseBody.responseData = typeof response.data === 'string' 
          ? response.data 
          : JSON.stringify(response.data);
        responseBody.url = urlEntity;

        const statusCode = new StatusCode();
        statusCode.code = response.status;
        statusCode.url = urlEntity;


        const successStatus = new SuccessStatus();
        successStatus.succcess = true;
        successStatus.url = urlEntity;

        const responseTime = new ResponseTime();
        responseTime.time = endTime;
        responseTime.url = urlEntity;

        
        await this.requestIntervalRepository.save(requestInterval),
        await this.responseBodyRepository.save(responseBody),
        await this.statusCodeRepository.save(statusCode),
        await this.successStatusRepository.save(successStatus),
        await this.responseTimeRepository.save(responseTime)
        

        console.log(`${urlEntity.id} 저장 완료`);
        
      } catch (error) {
        console.error('에러 발생:', error.message);
        
        const errorOccurredAt = new Date();
        const elapsedTime = errorOccurredAt.getTime() - currentTime.getTime();

        try {
          const statusCode = new StatusCode();
          statusCode.code = error.response?.status || 0;
          statusCode.url = urlEntity;

          const successStatus = new SuccessStatus();
          successStatus.succcess = false;
          successStatus.url = urlEntity;

          const responseTime = new ResponseTime();
          responseTime.time = errorOccurredAt;
          responseTime.url = urlEntity;

          const requestInterval = new RequestInterval();
          requestInterval.intervalTime = elapsedTime;
          requestInterval.url = urlEntity;

          const responseBody = new ResponseBody();
          responseBody.responseData = `요청 실패: ${error.message || 'Unknown error'}`;
          responseBody.url = urlEntity;


          await this.statusCodeRepository.save(statusCode),
          await this.successStatusRepository.save(successStatus),
          await this.responseTimeRepository.save(responseTime),
          await this.requestIntervalRepository.save(requestInterval),
          await this.responseBodyRepository.save(responseBody)

        } catch (dbError) {
          console.error('DB 저장 실패:', dbError.message);
        }

        if (error.response?.status >= 500 && error.response?.status < 600) {
          if (i < retries) {
            console.log(`재시도 중... (${i}/${retries})`);
            continue;
          }
        }

        return {
          responseTime: elapsedTime,
          statusCode: error.response?.status || 0,
          body: `요청 실패: ${error.message || 'Unknown error'}`,
          success: false,
        };
      }
    }
  }

  async scheduledApiCall(): Promise<void> {
    const apiEndpoints = await this.urlRepository.find({
      relations: ['parameters']
    });

    for(let i = 0; i < apiEndpoints.length; i++) {
      const urlEntity = apiEndpoints[i];
      
      const urlDto: RequestUrlDto = {
        id: urlEntity.id,
        url: urlEntity.url,
        callTime: urlEntity.callTime
      };

      const parameterDtos: RequestParameterDto[] = urlEntity.parameters ? 
        urlEntity.parameters.map(param => ({
          key: param.key,
          value: param.value,
          type: param.type
        })) : [];

      const result = await this.sendApiRequest({
        url: urlDto,
        parameters: parameterDtos
      });
      console.log('result', result);
    }
  }

}

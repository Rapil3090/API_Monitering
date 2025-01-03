import { BadRequestException, Inject, Injectable, NotFoundException, RequestTimeoutException } from '@nestjs/common';
import { CreateApiEndpointDto } from './dto/create-api-endpoint.dto';
import { UpdateApiEndpointDto } from './dto/update-api-endpoint.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiEndpoint } from './entities/api-endpoint.entity';
import { Repository } from 'typeorm';
import axios, { AxiosResponse } from 'axios';
import { ApiResponse } from 'src/api-response/entities/api-response.entity';


@Injectable()
export class ApiEndpointService {

  constructor(
    @InjectRepository(ApiEndpoint)
    private readonly apiEndpointRepository: Repository<ApiEndpoint>,
    @InjectRepository(ApiResponse)
    private readonly apiResponseRepository: Repository<ApiResponse>,
    @Inject('TIMERS_MAP') private readonly timers: Map<number, NodeJS.Timeout>,
  ){}

  async create(createApiEndpointDto: CreateApiEndpointDto) {

    const { url, parameters, callTime } = createApiEndpointDto;

    const existingUrl = await this.apiEndpointRepository.findOne({
      where: {
        url: createApiEndpointDto.url
      },
    });

    if(existingUrl) {
      throw new BadRequestException(`이미 저장된 url입니다. ${url}`)
    };

    const apiEndpoint = await this.apiEndpointRepository.create({
      url,
      parameters,
      callTime,
    });

    await this.apiEndpointRepository.save(apiEndpoint);


    return await this.apiEndpointRepository.findOne({
      where: {
        url,
      },
    });
  }

  async getAllEndpoints() {

    return this.apiEndpointRepository.find();
  }

  async findByUrl(id: number) {
    
    const existsByUrl= await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    if (!existsByUrl) {
      throw new NotFoundException(`해당 ${id}이 저장되어 있지 않습니다.`)
    };

    return existsByUrl;
  }

  async update(updateApiEndpointDto: UpdateApiEndpointDto) {

    const { id, url, parameters, callTime }  = updateApiEndpointDto;

    const apiEndpoint = await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    const existingEndpoint = await this.apiEndpointRepository.findOne({
      where: {
        url,
      },
    });

    if(existingEndpoint && id !== existingEndpoint.id) {
      throw new BadRequestException(`중복된 url : ${url} 입니다.`);
    }

    await this.apiEndpointRepository.update({
      id,
    }, {
      url,
      parameters,
      callTime,
    });

    const newApiEndpoint = await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    return newApiEndpoint;
  }

  async remove(id: number) {

    const existsByUrl= await this.apiEndpointRepository.findOne({
      where: {
        id,
      },
    });

    if (!existsByUrl) {
      throw new NotFoundException(`해당 ${id}이 저장되어 있지 않습니다.`)
    };

    await this.apiEndpointRepository.delete(id);

    return 'ok';
  }

  async sendApiRequest (apiEndpoint: ApiEndpoint) {

    const url = apiEndpoint.url;
    const parameters = apiEndpoint.parameters;
    const retries = 3;
    
    for (let i = 1; i <= retries; i++) {
      const startTime = Date.now();
  
      try {
        const response: AxiosResponse = await axios.get(url, {
          params: parameters.reduce((acc, param) => {
            if (param.type.toLowerCase() === 'query') {
              acc[param.key] = param.value;
            }
            return acc;
          }, {}),
          headers: parameters.reduce((acc, param) => {
            if (param.type.toLowerCase() === 'header') {
              acc[param.key] = param.value;
            }
            return acc;
          }, {}),
          timeout: 5000,
        });
  
        const responseTime = Date.now() - startTime;
  
        const apiResponse = {
          responseTime,
          body: response.data.substring(0, 255),
          statusCode: response.status,
          success: true,
        };
  
        await this.apiResponseRepository.save(apiResponse);
        return apiResponse;
  
      } catch (error) {

        if (error.response && error.response.status === 500) {
          console.warn(`HTTP 500 에러 발생. 재시도 중 (${i}/${retries})`);
          
          if (i === retries) {
            console.error(`최대 재시도 횟수 초과: ${apiEndpoint.url}`);
            throw new RequestTimeoutException(
              `${apiEndpoint.url} 의 요청이 실패하였습니다. ID: ${apiEndpoint.id}`
            );
          }
          continue;
        }
      }}
  };

  async scheduledApiCall() : Promise<void> {

    const apiEndpoints = await this.apiEndpointRepository.find();

    apiEndpoints.forEach(apiEndpoint => {

      if (this.timers.has(apiEndpoint.id)) {
        console.log(`이미 실행중인 타이머가 있습니다. (${apiEndpoint.url}, id${apiEndpoint.id})`);
        return;
      }

      const timer = setInterval(() => {
        this.sendApiRequest(apiEndpoint)
        .then(response => console.log('응답', response))
        .catch(error => console.log('에러', error.message));
      }, apiEndpoint.callTime);

      this.timers.set(apiEndpoint.id, timer);
    });
  };

  stopAllTimer() {
    this.timers.forEach((timer, id) => {
      clearInterval(timer);
    });
    this.timers.clear();
  };

  


}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
  ){}

  async create(createApiEndpointDto: CreateApiEndpointDto) {

    const { url, parameters } = createApiEndpointDto;

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

    const { id, url, parameters }  = updateApiEndpointDto;

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

  async sendApiRequest () {
    
    const apiEndpoint = await this.apiEndpointRepository.find();

    console.log(apiEndpoint);

    for (const endpoint of apiEndpoint) {
      const url = endpoint.url;
      const parameters = endpoint.parameters;
      const startTime = Date.now();

      const response : AxiosResponse = await axios.get(url, {
        params: parameters.reduce((acc, param) => {
          if(param.type.toLowerCase() === 'query') {
            acc[param.key] = param.value;
          }
          return acc;
        }, {}),

        headers: parameters.reduce((acc, param) => {
          if (param.type.toLowerCase() === 'header') {
            acc[param.key] = param.value;
          }
          return acc;
        }, {})
      });

      const responseTime = Date.now() - startTime;
      const apiRespones = {
        responseTime,
        body: response.data.substring(0, 255),
        statusCode: response.status,
        success: true
      };

      await this.apiResponseRepository.save(apiRespones);

      return apiRespones;
      
    }


    
    
  }
}

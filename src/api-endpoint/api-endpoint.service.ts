import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateApiEndpointDto } from './dto/create-api-endpoint.dto';
import { UpdateApiEndpointDto } from './dto/update-api-endpoint.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ApiEndpoint } from './entities/api-endpoint.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ApiEndpointService {

  constructor(
    @InjectRepository(ApiEndpoint)
    private readonly apiEndpointRepository: Repository<ApiEndpoint>,
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

  async findByUrl(url: string) {
    
    const existsByUrl= await this.apiEndpointRepository.findOne({
      where: {
        url,
      },
    });

    if (!existsByUrl) {
      throw new NotFoundException(`해당 ${url}이 저장되어 있지 않습니다.`)
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
}

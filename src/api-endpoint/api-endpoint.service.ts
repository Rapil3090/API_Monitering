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
      parameters: parameters
    });

    await this.apiEndpointRepository.save(apiEndpoint);


    return 'ok';
    
  }

  async getAllEndpoints() {

    return this.apiEndpointRepository.find();
  }

  // url 기준으로 검색해서 저장된 정보를 가져온다
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

  update(id: number, updateApiEndpointDto: UpdateApiEndpointDto) {
    return `This action updates a #${id} apiEndpoint`;
  }

  remove(id: number) {
    return `This action removes a #${id} apiEndpoint`;
  }
}

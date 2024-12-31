import { BadRequestException, Injectable } from '@nestjs/common';
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

  async findAll() {

    return this.apiEndpointRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} apiEndpoint`;
  }

  update(id: number, updateApiEndpointDto: UpdateApiEndpointDto) {
    return `This action updates a #${id} apiEndpoint`;
  }

  remove(id: number) {
    return `This action removes a #${id} apiEndpoint`;
  }
}

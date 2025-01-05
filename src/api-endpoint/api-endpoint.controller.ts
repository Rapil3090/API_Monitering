import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, InternalServerErrorException } from '@nestjs/common';
import { ApiEndpointService } from './api-endpoint.service';
import { CreateApiEndpointDto } from './dto/create-api-endpoint.dto';
import { UpdateApiEndpointDto } from './dto/update-api-endpoint.dto';

@Controller('api-endpoint')
export class ApiEndpointController {
  constructor(private readonly apiEndpointService: ApiEndpointService) {}

  @Post()
  create(@Body() createApiEndpointDto: CreateApiEndpointDto) {
    return this.apiEndpointService.create(createApiEndpointDto);
  }

  @Get()
  findAll() {
    return this.apiEndpointService.getAllEndpoints();
  }

  @Get(':id')
  findByUrl(@Param('id') id: number) {
    return this.apiEndpointService.findById(id);
  }

  @Patch()
  update(@Body() updateApiEndpointDto: UpdateApiEndpointDto) {
    return this.apiEndpointService.update(updateApiEndpointDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.apiEndpointService.remove(id);
  }

  @Get('/test/test')
  test() {
    return this.apiEndpointService.scheduledApiCall();
  }

  @Get('/test/apicallstop')
  apiCallStop() {
    return this.apiEndpointService.stopAllTimer();
  }

  @Get('/test/500')
  triggerError() {
    throw new InternalServerErrorException('의도적으로 발생시킴')
  }
}

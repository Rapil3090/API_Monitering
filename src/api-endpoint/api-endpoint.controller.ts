import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
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

  @Get(':url')
  findByUrl(@Param('url') url: string) {
    return this.apiEndpointService.findByUrl(url);
  }

  @Patch()
  update(@Body() updateApiEndpointDto: UpdateApiEndpointDto) {
    return this.apiEndpointService.update(updateApiEndpointDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.apiEndpointService.remove(id);
  }
}
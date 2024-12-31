import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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
  findOne(@Param('id') id: string) {
    return this.apiEndpointService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApiEndpointDto: UpdateApiEndpointDto) {
    return this.apiEndpointService.update(+id, updateApiEndpointDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiEndpointService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiResponseService } from './api-response.service';
import { CreateApiResponseDto } from './dto/create-api-response.dto';
import { UpdateApiResponseDto } from './dto/update-api-response.dto';

@Controller('api-response')
export class ApiResponseController {
  constructor(private readonly apiResponseService: ApiResponseService) {}

  @Post()
  create(@Body() createApiResponseDto: CreateApiResponseDto) {
    return this.apiResponseService.create(createApiResponseDto);
  }

  @Get()
  findAll() {
    return this.apiResponseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apiResponseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateApiResponseDto: UpdateApiResponseDto) {
    return this.apiResponseService.update(+id, updateApiResponseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.apiResponseService.remove(+id);
  }
}

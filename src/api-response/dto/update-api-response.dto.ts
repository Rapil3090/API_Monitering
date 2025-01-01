import { PartialType } from '@nestjs/mapped-types';
import { CreateApiResponseDto } from './create-api-response.dto';

export class UpdateApiResponseDto extends PartialType(CreateApiResponseDto) {}

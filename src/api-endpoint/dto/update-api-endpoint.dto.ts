import { PartialType } from '@nestjs/mapped-types';
import { CreateApiEndpointDto } from './create-api-endpoint.dto';

export class UpdateApiEndpointDto extends PartialType(CreateApiEndpointDto) {}

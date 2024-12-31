import { PartialType } from '@nestjs/mapped-types';
import { CreateApiEndpointDto } from './create-api-endpoint.dto';
import { IsNotEmpty } from 'class-validator';

export class UpdateApiEndpointDto extends PartialType(CreateApiEndpointDto) {

    @IsNotEmpty()
    id: number;
}

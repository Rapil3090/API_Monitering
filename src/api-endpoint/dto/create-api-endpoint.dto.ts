import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateApiEndpointDto {

    @IsString()
    @IsNotEmpty()
    url: string;

    @IsNotEmpty()
    @IsArray()
    parameters?: Record<any, any>;

}

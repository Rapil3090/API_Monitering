import { IsBoolean, IsDate, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class ApiResponseDto {
    @IsString()
    id: string;

    @IsString()
    url: string;
  
    @IsNumber()
    statusCode: number;
  
    @IsNumber()
    responseTime: number;
  
    @IsBoolean()
    success: boolean;
  
    @IsDate()
    timestamp: String;
  
    @IsObject()
    @IsOptional()
    responseBody?: any;
  
    @IsString()
    @IsOptional()
    errorMessage?: string;
  }
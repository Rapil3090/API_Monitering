import { IsBoolean, IsDate, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

export class ApiResponseDto {
    @IsString()
    id: string;
  
    @IsString()
    endpointId: string;
  
    @IsNumber()
    statusCode: number;
  
    @IsNumber()
    responseTime: number;
  
    @IsBoolean()
    success: boolean;
  
    @IsDate()
    timestamp: Date;
  
    @IsObject()
    @IsOptional()
    responseBody?: any;
  
    @IsString()
    @IsOptional()
    errorMessage?: string;
  }
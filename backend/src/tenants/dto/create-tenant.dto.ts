import { IsString, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name: string;
  
  @IsString()
  phone: string;
  
  @IsString()
  @IsOptional()
  idCard?: string;
  
  @IsString()
  @IsOptional()
  email?: string;
  
  @IsString()
  @IsOptional()
  emergencyContact?: string;
  
  @IsString()
  @IsOptional()
  emergencyPhone?: string;
  
  @IsNumber()
  houseId: number;
  
  @IsDateString()
  startDate: string;
  
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
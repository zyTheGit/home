import { IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  idCard: string;

  @IsDateString()
  checkInDate: string;

  @IsDateString()
  @IsOptional()
  checkOutDate?: string;

  @IsNumber()
  houseId: number;
} 
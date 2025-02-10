import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsOptional()
  @IsString()
  remark?: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  houseId: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  waterUsage?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  electricityUsage?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  otherAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  baseRent?: number;

  @IsNumber()
  @IsOptional()
  tenantId?: number;

  @IsDate()
  @IsOptional()
  startDate?: Date;

  @IsDate()
  @IsOptional()
  endDate?: Date;
}
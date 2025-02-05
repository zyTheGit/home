import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @IsNotEmpty()
  @IsDateString()  // 改用 IsDateString 验证器
  date: string;

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
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  otherAmount?: number;
}
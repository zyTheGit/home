import { IsString, IsNumber, IsEnum, IsArray, IsOptional } from 'class-validator';

export class CreateHouseDto {
  @IsString({ message: '房源标题不能为空' })
  title: string;

  @IsString({ message: '地址不能为空' })
  address: string;

  @IsNumber({}, { message: '基础租金必须是数字' })
  baseRent: number;

  @IsNumber({}, { message: '水费单价必须是数字' })
  waterRate: number;

  @IsNumber({}, { message: '电费单价必须是数字' })
  electricityRate: number;

  @IsNumber({}, { message: '面积必须是数字' })
  area: number;

  @IsEnum(['available', 'rented', 'maintenance'], { 
    message: '状态必须是：available(可租)、rented(已租)或maintenance(维护中)' 
  })
  status: 'available' | 'rented' | 'maintenance';

  @IsString({ message: '描述必须是字符串' })
  @IsOptional()
  description?: string;

  @IsArray({ message: '设施必须是数组' })
  @IsString({ each: true, message: '每个设施必须是字符串' })
  amenities: string[];

  @IsNumber({}, { message: '初始水表读数必须是数字' })
  @IsOptional()
  initialWaterReading?: number;

  @IsNumber({}, { message: '初始电表读数必须是数字' })
  @IsOptional()
  initialElectricityReading?: number;
} 
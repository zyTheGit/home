import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateTenantDto {
  @IsString({ message: '姓名不能为空' })
  name: string;
  
  @IsString({ message: '手机号不能为空' })
  phone: string;
  
  @IsString({ message: '身份证号不能为空' })
  @IsOptional()  // 添加这一行，表示该字段可选
  idCard: string;
  
  @IsDateString({}, { message: '入住日期格式不正确，请使用YYYY-MM-DD格式' })
  startDate: string;
  
  @IsDateString({}, { message: '退租日期格式不正确，请使用YYYY-MM-DD格式' })
  @IsOptional()
  endDate?: string;
  
  @IsNumber({}, { message: '房源ID必须是数字' })
  houseId: number;
}
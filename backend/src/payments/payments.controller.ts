import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(+id);
  }

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return {
      data: await this.paymentsService.create(createPaymentDto),
      message: '添加缴费记录成功'
    };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(+id);
  }

  @Get('house/:houseId')
  async findByHouse(@Param('houseId') houseId: string) {
    return {
      data: await this.paymentsService.findByHouse(+houseId),
      message: '获取缴费记录成功'
    };
  }

  @Get('house/:houseId/balance')
  async getBalance(@Param('houseId') houseId: string) {
    return {
      data: await this.paymentsService.getBalance(+houseId),
      message: '获取余额成功'
    };
  }

  @Get('tenant/:tenantId')
  async findByTenant(@Param('tenantId') tenantId: string) {
    return {
      data: await this.paymentsService.findByTenant(+tenantId),
      message: '获取租客缴费记录成功'
    };
  }

  @Get('house/:houseId/status')
  async getHousePaymentStatus(@Param('houseId') houseId: string) {
    return {
      data: await this.paymentsService.getHousePaymentStatus(+houseId),
      message: '获取房屋缴费状态成功'
    };
  }
} 
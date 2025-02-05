import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { House } from '../houses/entities/house.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async findAll() {
    return await this.paymentRepository.find({
      relations: ['house', 'tenant']
    });
  }

  async findOne(id: number) {
    return await this.paymentRepository.findOne({
      where: { id },
      relations: ['house', 'tenant']
    });
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    try {
      const house = await this.houseRepository.findOne({
        where: { id: createPaymentDto.houseId }
      });
    
      if (!house) {
        throw new BadRequestException('房屋不存在');
      }
    
      // 格式化日期
      const formattedDate = new Date(createPaymentDto.date);
      if (isNaN(formattedDate.getTime())) {
        throw new BadRequestException('日期格式不正确');
      }
    
      // 获取上一次的抄表记录
      const lastPayment = await this.paymentRepository.findOne({
        where: { houseId: house.id },
        order: { date: 'DESC' }
      });

      if (lastPayment && lastPayment.date > formattedDate) {
        throw new BadRequestException('日期不能早于上一次抄表记录');
      }
    
      let amount = createPaymentDto.amount || 0;
      // 使用 create 方法创建实体实例
      const payment = this.paymentRepository.create({
        ...createPaymentDto,
        date: formattedDate,  // 使用 Date 对象
        house,
        previousWaterUsage: lastPayment?.waterUsage || 0,
        previousElectricityUsage: lastPayment?.electricityUsage || 0,
        balance: lastPayment?.balance || 0,
      });
      // 计算水费
      if (payment.waterUsage !== undefined) {
        const waterUsed = payment.waterUsage - payment.previousWaterUsage;
        const waterFee = waterUsed * house.waterRate;
        amount += waterFee;
      }
      // 计算电费
      if (payment.electricityUsage !== undefined) {
        const electricityUsed = payment.electricityUsage - payment.previousElectricityUsage;
        const electricityFee = electricityUsed * house.electricityRate;
        amount += electricityFee;
      }
      // 如果是房租，直接使用基础租金
      if (payment.type === 'rent') {
        amount = house.baseRent;
      }
      // 更新余额
      if (payment.type === 'deposit') {
        payment.balance += amount;
      } else {
        payment.balance = (lastPayment?.balance || 0) - amount;
      }
      payment.amount = amount;
      // 使用 save 方法保存单个实体
      return await this.paymentRepository.save(payment);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('创建支付记录失败：' + error.message);
    }
  }
  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    if (!payment) {
      throw new BadRequestException('支付记录不存在');
    }
    // 使用 Object.assign 更新实体
    Object.assign(payment, {
      ...updatePaymentDto,
    });
    // 保存更新后的实体
    return await this.paymentRepository.save(payment);
  }
  async remove(id: number) {
    const payment = await this.findOne(id);
    return await this.paymentRepository.remove(payment);
  }
  async findByHouse(houseId: number): Promise<Payment[]> {
    const house = await this.houseRepository.findOne({
      where: { id: houseId }
    });
    if (!house) {
      throw new BadRequestException('房屋不存在');
    }
    return await this.paymentRepository.find({
      where: { houseId },
      order: { date: 'DESC' }
    });
  }
  async getStatistics() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const monthlyPayments = await this.paymentRepository.find({
    where: {
      date: Between(firstDayOfMonth, lastDayOfMonth)
    }
  });
  const statistics = {
    totalIncome: 0,
    monthlyIncome: 0,
    rentIncome: 0,
    utilityIncome: 0,
    paymentsByType: {
      rent: 0,
      water: 0,
      electricity: 0,
      other: 0
    }
  };
  monthlyPayments.forEach(payment => {
    statistics.monthlyIncome += Number(payment.amount);
    statistics.paymentsByType[payment.type] += Number(payment.amount);
  });
  return statistics;
}
async getBalance(houseId: number): Promise<number> {
  const lastPayment = await this.paymentRepository.findOne({
    where: { houseId },
    order: { date: 'DESC' }
  });
  return lastPayment?.balance || 0;
}
async findByTenant(tenantId: number): Promise<Payment[]> {
  return await this.paymentRepository.find({
    where: { tenantId },
    order: { date: 'DESC' },
    relations: ['house']
  });
}
async getHousePaymentStatus(houseId: number) {
  const house = await this.houseRepository.findOne({
    where: { id: houseId },
    relations: ['tenant']
  });
  if (!house || !house.tenant) {
    return {
      status: 'no_tenant',
      amount: 0,
      lastPaymentDate: null,
      monthsDiff: 0
    };
  }
  // 获取最近一次缴费记录
  const lastPayment = await this.paymentRepository.findOne({
    where: { houseId },
    order: { date: 'DESC' }
  });
  // 计算从入住到现在的月数
  const startDate = new Date(house.tenant.startDate);
  const now = new Date();
  const monthsDiff = this.calculateMonthsDiff(startDate, now);
  // 计算应缴总额（每月房租）
  const expectedAmount = house.baseRent * monthsDiff;
  // 获取实际缴费总额
  const paidAmount = await this.paymentRepository
    .createQueryBuilder('payment')
    .where('payment.houseId = :houseId', { houseId })
    .andWhere('payment.type = :type', { type: 'rent' })
    .select('SUM(payment.amount)', 'total')
    .getRawOne()
    .then(result => Number(result.total) || 0);
  const balance = paidAmount - expectedAmount;
  return {
    status: balance >= 0 ? 'paid' : 'unpaid',
    amount: Math.abs(balance),
    lastPaymentDate: lastPayment?.date || null,
    monthsDiff
  };
}
private calculateMonthsDiff(startDate: Date, endDate: Date): number {
  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  return months + endDate.getMonth() - startDate.getMonth();
}
}
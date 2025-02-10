import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { House } from '../houses/entities/house.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { startOfYear, endOfYear } from 'date-fns';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async getOverview() {
    // 获取所有房源和租客
    const [houses, tenants] = await Promise.all([
      this.houseRepository.find(),
      this.tenantRepository.find({ relations: ['house'] })
    ]);

    // 获取租客绑定的房源ID列表
    const rentedHouseIds = tenants.map(tenant => tenant.house?.id).filter(Boolean);

    // 更新房源状态统计
    const houseStats = houses.reduce((acc, house) => {
      // 如果房源ID在已租列表中，则计为已租
      const status = rentedHouseIds.includes(house.id) ? 'rented' : house.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 计算总收入
    const totalIncome = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'total')
      .getRawOne()
      .then(result => result.total || 0);

    return {
      totalHouses: houses.length,
      availableHouses: houseStats['available'] || 0,
      rentedHouses: houseStats['rented'] || 0,
      maintenanceHouses: houseStats['maintenance'] || 0,
      totalTenants: tenants.length,
      totalIncome: Number(totalIncome)
    };
  }

  async getMonthlyStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const monthlyPayments = await this.paymentRepository.find({
      where: {
        createdAt: Between(firstDayOfMonth, lastDayOfMonth)
      }
    });

    const stats = {
      baseRent: 0,
      waterFee: 0,
      electricityFee: 0,
      other: 0,
      total: 0
    };

    monthlyPayments.forEach(payment => {
      // 基础房租
      if (payment.baseRent) {
        stats.baseRent += Number(payment.baseRent);
      }

      // 水费
      if (payment.waterUsage && payment.previousWaterUsage) {
        const waterUsed = Number(payment.waterUsage) - Number(payment.previousWaterUsage);
        stats.waterFee += waterUsed;
      }

      // 电费
      if (payment.electricityUsage && payment.previousElectricityUsage) {
        const electricityUsed = Number(payment.electricityUsage) - Number(payment.previousElectricityUsage);
        stats.electricityFee += electricityUsed;
      }

      // 其他费用
      const knownFees = stats.baseRent + stats.waterFee + stats.electricityFee;
      if (payment.amount > knownFees) {
        stats.other += Number(payment.amount) - knownFees;
      }

      stats.total += Number(payment.amount);
    });

    return stats;
  }

  async getPaymentStatistics(startDate: Date, endDate: Date) {
    const payments = await this.paymentRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const stats = {
      totalAmount: 0,
      baseRent: 0,
      waterFee: 0,
      electricityFee: 0,
      otherFees: 0,
    };

    payments.forEach(payment => {
      // 总金额
      stats.totalAmount += Number(payment.amount || 0);

      // 基础房租
      if (payment.baseRent) {
        stats.baseRent += Number(payment.baseRent);
      }

      // 水费（根据用量和上次用量计算）
      if (payment.waterUsage && payment.previousWaterUsage) {
        const waterUsed = Number(payment.waterUsage) - Number(payment.previousWaterUsage);
        stats.waterFee += waterUsed;
      }

      // 电费（根据用量和上次用量计算）
      if (payment.electricityUsage && payment.previousElectricityUsage) {
        const electricityUsed = Number(payment.electricityUsage) - Number(payment.previousElectricityUsage);
        stats.electricityFee += electricityUsed;
      }

      // 其他费用（总金额减去已知费用）
      const knownFees = (payment.baseRent || 0) + stats.waterFee + stats.electricityFee;
      if (payment.amount > knownFees) {
        stats.otherFees += Number(payment.amount) - knownFees;
      }
    });

    return {
      ...stats,
      totalPayments: payments.length,
      averagePayment: payments.length > 0 ? stats.totalAmount / payments.length : 0,
    };
  }

  async getMonthlyStatistics() {
    const _startOfYear = startOfYear(new Date());
    const _endOfYear = endOfYear(new Date());

    const payments = await this.paymentRepository.find({
      where: {
        createdAt: Between(_startOfYear, _endOfYear),
      },
    });

    const monthlyStats = {};
    
    // 初始化每个月的统计数据
    for (let i = 0; i < 12; i++) {
      monthlyStats[i] = {
        totalAmount: 0,
        baseRent: 0,
        waterFee: 0,
        electricityFee: 0,
        otherFees: 0,
        count: 0,
      };
    }

    payments.forEach(payment => {
      const month = new Date(payment.createdAt).getMonth();
      monthlyStats[month].totalAmount += Number(payment.amount || 0);
      monthlyStats[month].baseRent += Number(payment.baseRent || 0);
      
      // 计算水费
      if (payment.waterUsage && payment.previousWaterUsage) {
        const waterUsed = Number(payment.waterUsage) - Number(payment.previousWaterUsage);
        monthlyStats[month].waterFee += waterUsed;
      }

      // 计算电费
      if (payment.electricityUsage && payment.previousElectricityUsage) {
        const electricityUsed = Number(payment.electricityUsage) - Number(payment.previousElectricityUsage);
        monthlyStats[month].electricityFee += electricityUsed;
      }

      // 其他费用
      const knownFees = (payment.baseRent || 0) + 
                       monthlyStats[month].waterFee + 
                       monthlyStats[month].electricityFee;
      if (payment.amount > knownFees) {
        monthlyStats[month].otherFees += Number(payment.amount) - knownFees;
      }

      monthlyStats[month].count++;
    });

    return monthlyStats;
  }
} 
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { House } from '../houses/entities/house.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

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
    }, {});

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
        date: Between(firstDayOfMonth, lastDayOfMonth)
      }
    });

    const stats = {
      rent: 0,
      water: 0,
      electricity: 0,
      other: 0,
      total: 0
    };

    monthlyPayments.forEach(payment => {
      stats[payment.type] += Number(payment.amount);
      stats.total += Number(payment.amount);
    });

    return stats;
  }
} 
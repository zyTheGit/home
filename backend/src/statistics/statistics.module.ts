import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsController } from './statistics.controller';
import { StatisticsService } from './statistics.service';
import { House } from '../houses/entities/house.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Tenant } from '../tenants/entities/tenant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([House, Payment, Tenant])
  ],
  controllers: [StatisticsController],
  providers: [StatisticsService],
})
export class StatisticsModule {} 
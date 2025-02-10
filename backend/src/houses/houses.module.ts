import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { House } from './entities/house.entity';
import { HousesService } from './houses.service';
import { HousesController } from './houses.controller';
import { Tenant } from 'src/tenants/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([House, Tenant])],
  controllers: [HousesController],
  providers: [HousesService],
  exports: [HousesService],
})
export class HousesModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantsService } from './tenants.service';
import { TenantsController } from './tenants.controller';
import { House } from '../houses/entities/house.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tenant, House])],
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {} 
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { HousesModule } from './houses/houses.module';
import { TenantsModule } from './tenants/tenants.module';
import { PaymentsModule } from './payments/payments.module';
import { House } from './houses/entities/house.entity';
import { Payment } from './payments/entities/payment.entity';
import { Tenant } from './tenants/entities/tenant.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [House, Payment, Tenant],  // 添加 Tenant 实体
      synchronize: true,
    }),
    AuthModule,
    HousesModule,
    TenantsModule,
    PaymentsModule,
  ],
})
export class AppModule {} 
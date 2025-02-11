import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { HousesModule } from "./houses/houses.module";
import { TenantsModule } from "./tenants/tenants.module";
import { PaymentsModule } from "./payments/payments.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { AppDataSource } from './data-source';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => AppDataSource.options,
    }),
    AuthModule,
    UsersModule,
    HousesModule,
    TenantsModule,
    PaymentsModule,
    StatisticsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

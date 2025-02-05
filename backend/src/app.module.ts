import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { UsersModule } from "./users/users.module";
import { HousesModule } from "./houses/houses.module";
import { TenantsModule } from "./tenants/tenants.module";
import { PaymentsModule } from "./payments/payments.module";
import { StatisticsModule } from "./statistics/statistics.module";
import { House } from "./houses/entities/house.entity";
import { Payment } from "./payments/entities/payment.entity";
import { Tenant } from "./tenants/entities/tenant.entity";
import { User } from "./users/entities/user.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get("DB_HOST"),
        port: configService.get("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        entities: [User, House, Tenant, Payment],
        synchronize: true,
        extra: {
          timezone: "Z", // 设置为 UTC
        },
        // dropSchema: true,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    HousesModule,
    TenantsModule,
    PaymentsModule,
    StatisticsModule,
  ],
})
export class AppModule {}

import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";
import { Logger } from '@nestjs/common';

dotenv.config();  // 简化配置，因为环境文件已经由 PM2 加载

const logger = new Logger('DataSource');

const options: DataSourceOptions = {
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.NODE_ENV !== "production",
  // synchronize: true,
  logging: false,
  dateStrings: true,
  entities: [path.join(__dirname, "./**/*.entity{.ts,.js}")],
  migrations: [path.join(__dirname, "./migrations/*{.ts,.js}")],
  timezone: "+08:00",
  subscribers: [],
};

// 使用 NestJS Logger 输出数据库配置
logger.log('Database configuration:', {
  host: options.host,
  port: options.port,
  database: options.database,
  username: options.username,
  synchronize: options.synchronize,
  timezone: options.timezone,
  entities: options.entities,
  migrations: options.migrations,
});

export const AppDataSource = new DataSource(options);

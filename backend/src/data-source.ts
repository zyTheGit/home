import { DataSource, DataSourceOptions } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config();

const options: DataSourceOptions = {
  type: "mysql",
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "3306"),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  synchronize: process.env.NODE_ENV !== "production",
  // synchronize: true,
  logging: true,
  dateStrings: true,
  entities: [path.join(__dirname, "./**/*.entity{.ts,.js}")],
  migrations: [path.join(__dirname, "./migrations/*{.ts,.js}")],
  timezone: "+08:00",
  subscribers: [],
};

console.log("Database options:", options);

export const AppDataSource = new DataSource(options);

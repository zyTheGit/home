import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from "typeorm";
import { House } from "../../houses/entities/house.entity";
import { Tenant } from "../../tenants/entities/tenant.entity";

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number; // 缴费记录ID

  @Column("decimal", { precision: 10, scale: 2 })
  amount: number; // 实际缴费金额

  @Column({ nullable: true })
  remark: string; // 备注

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  waterUsage: number; // 本次水表读数

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  electricityUsage: number; // 本次电表读数

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  previousWaterUsage: number; // 上次水表读数

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  previousElectricityUsage: number; // 上次电表读数

  @Column("decimal", { precision: 10, scale: 2, default: 0 })
  balance: number; // 结余/欠费金额

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  baseRent: number; // 基础房租

  @Column({ 
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date; // 缴费时间

  @ManyToOne(() => House, (house) => house.payments)
  house: House; // 关联房屋

  @ManyToOne(() => Tenant, (tenant) => tenant.payments)
  tenant: Tenant; // 关联租户

  @Column()
  houseId: number; // 房屋ID

  @Column({ nullable: true })
  tenantId: number; // 租户ID

  @Column({ 
    type: 'datetime',
    nullable: true
  })
  startDate: Date; // 缴费周期开始时间

  @Column({ 
    type: 'datetime',
    nullable: true
  })
  endDate: Date; // 缴费周期结束时间
}

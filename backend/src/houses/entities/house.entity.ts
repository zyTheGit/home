import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity()
export class House {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  address: string;

  @Column('decimal', { precision: 10, scale: 2 })
  baseRent: number;  // 基础租金

  @Column('decimal', { precision: 10, scale: 2 })
  waterRate: number;  // 水费单价

  @Column('decimal', { precision: 10, scale: 2 })
  electricityRate: number;  // 电费单价

  @Column('decimal', { precision: 10, scale: 2 })
  area: number;

  @Column({
    type: 'enum',
    enum: ['available', 'rented', 'maintenance'],
    default: 'available'
  })
  status: 'available' | 'rented' | 'maintenance';

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('simple-array')
  amenities: string[];  // 房屋设施

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  initialWaterReading: number;  // 初始水表读数

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  initialElectricityReading: number;  // 初始电表读数

  @OneToOne(() => Tenant, tenant => tenant.house)
  @JoinColumn()
  tenant: Tenant;

  @OneToMany(() => Payment, payment => payment.house)
  payments: Payment[];
} 
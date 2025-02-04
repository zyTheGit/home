import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

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

  @Column()
  area: number;

  @Column({
    type: 'enum',
    enum: ['available', 'rented', 'maintenance'],
    default: 'available'
  })
  status: 'available' | 'rented' | 'maintenance';

  @Column({ nullable: true })
  description: string;

  @Column('simple-array', { nullable: true })
  amenities: string[];  // 房屋设施

  @OneToMany(() => Payment, payment => payment.house)
  payments: Payment[];

  @OneToMany(() => Tenant, tenant => tenant.house)
  tenants: Tenant[];
} 
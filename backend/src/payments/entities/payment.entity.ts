import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { House } from '../../houses/entities/house.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => House, house => house.payments)
  house: House;

  @ManyToOne(() => Tenant, tenant => tenant.payments)
  tenant: Tenant;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  rentAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  waterFee: number;

  @Column('decimal', { precision: 10, scale: 2 })
  electricityFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  waterReading: number;  // 水表读数

  @Column('decimal', { precision: 10, scale: 2 })
  electricityReading: number;  // 电表读数

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'enum',
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending'
  })
  status: 'pending' | 'paid' | 'overdue';

  @Column({ type: 'text', nullable: true })
  notes: string;
} 
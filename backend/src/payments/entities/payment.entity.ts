import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { House } from '../../houses/entities/house.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['rent', 'water', 'electricity', 'deposit', 'other'],
  })
  type: 'rent' | 'water' | 'electricity' | 'deposit' | 'other';

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  remark: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  waterUsage: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  electricityUsage: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  previousWaterUsage: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  previousElectricityUsage: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => House, house => house.payments)
  house: House;

  @ManyToOne(() => Tenant, tenant => tenant.payments)
  tenant: Tenant;

  @Column()
  houseId: number;

  @Column({ nullable: true })
  tenantId: number;
} 
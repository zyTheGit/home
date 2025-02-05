import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { House } from '../../houses/entities/house.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  idCard: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => House, house => house.tenants)
  house: House;

  @OneToMany(() => Payment, payment => payment.tenant)
  payments: Payment[];
} 
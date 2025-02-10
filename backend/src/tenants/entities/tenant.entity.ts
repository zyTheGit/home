import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { House } from '../../houses/entities/house.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  idCard: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  emergencyContact: string;

  @Column({ nullable: true })
  emergencyPhone: string;

  @OneToOne(() => House, house => house.tenant)
  house: House;

  @Column({ nullable: true })
  houseId: number;

  @Column({ 
    type: 'datetime',
    nullable: true 
  })
  startDate: Date;  // 入住时间

  @Column({ 
    type: 'datetime',
    nullable: true 
  })
  endDate: Date;    // 预计退租时间

  @OneToMany(() => Payment, payment => payment.tenant)
  payments: Payment[];

  @Column({ 
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP'
  })
  createdAt: Date;
} 
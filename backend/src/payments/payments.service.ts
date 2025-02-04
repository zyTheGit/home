import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async findAll() {
    return await this.paymentRepository.find({
      relations: ['house', 'tenant']
    });
  }

  async findOne(id: number) {
    return await this.paymentRepository.findOne({
      where: { id },
      relations: ['house', 'tenant']
    });
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const payment = this.paymentRepository.create(createPaymentDto);
    return await this.paymentRepository.save(payment);
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    await this.paymentRepository.update(id, updatePaymentDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    return await this.paymentRepository.remove(payment);
  }
} 
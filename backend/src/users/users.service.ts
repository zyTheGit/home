import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createAdminIfNotExists();
  }

  private async createAdminIfNotExists() {
    const adminPhone = this.configService.get('ADMIN_PHONE');
    
    let admin = await this.userRepository.findOne({
      where: { phone: adminPhone }
    });

    if (!admin) {
      const newAdmin = this.userRepository.create({
        phone: adminPhone,
        password: this.configService.get('ADMIN_PASSWORD'),
        name: this.configService.get('ADMIN_NAME'),
        role: 'admin'
      });

      await this.userRepository.save(newAdmin);
      console.log('超级管理员账号已创建');
    }
  }

  async findByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { phone } });
  }

  async create(createUserDto: Partial<User>): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async update(id: number, updateUserDto: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.userRepository.findOne({ where: { id } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }
} 
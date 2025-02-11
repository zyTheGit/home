import { Injectable, NotFoundException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { House } from './entities/house.entity';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';
import { Tenant } from '../tenants/entities/tenant.entity';

@Injectable()
export class HousesService {
  constructor(
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createHouseDto: CreateHouseDto): Promise<House> {
    const house = this.houseRepository.create(createHouseDto);
    return await this.houseRepository.save(house);
  }

  async findAll(): Promise<House[]> {
    try {
      return await this.houseRepository.find({
        relations: ['tenant', 'payments']
      });
    } catch (error) {
      console.error('查询房屋列表失败:', error);
      throw new InternalServerErrorException('获取房屋列表失败');
    }
  }

  async findOne(id: number, userId?: number): Promise<House> {
    const house = await this.houseRepository.findOne({
      where: { id },
      relations: ['tenant', 'tenant.payments', 'payments']
    });
    
    if (!house) {
      throw new NotFoundException('房屋不存在');
    }

    // // 如果是普通用户，只返回基础信息，不返回缴费相关信息
    // if (userId && house.tenant?.id !== userId) {
    //   throw new UnauthorizedException('无权访问该房屋信息');
    // }

    if (userId && house.tenant?.id === userId) {
      // 普通用户只返回基础信息
      const { payments, tenant, ...basicInfo } = house;
      return {
        ...basicInfo,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          phone: tenant.phone
        }
      } as House;
    }

    return house;
  }

  async update(id: number, updateHouseDto: UpdateHouseDto): Promise<House> {
    const house = await this.findOne(id);
    Object.assign(house, updateHouseDto);
    return await this.houseRepository.save(house);
  }

  async remove(id: number): Promise<void> {
    const house = await this.findOne(id);
    await this.houseRepository.remove(house);
  }
} 
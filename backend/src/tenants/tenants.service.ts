import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { House } from '../houses/entities/house.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const house = await this.houseRepository.findOne({
      where: { id: createTenantDto.houseId }
    });

    if (!house) {
      throw new BadRequestException('房屋不存在');
    }

    if (house.status !== 'available') {
      throw new BadRequestException('该房屋已被租用或不可租');
    }

    // 更新房屋状态为已租
    await this.houseRepository.update(house.id, { status: 'rented' });

    const tenant = this.tenantsRepository.create(createTenantDto);
    tenant.house = house;

    // 保存租客信息
    const savedTenant = await this.tenantsRepository.save(tenant);

    // 返回包含房屋信息的完整数据
    return await this.tenantsRepository.findOne({
      where: { id: savedTenant.id },
      relations: ['house']
    });
  }

  async update(id: number, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    try {
      const tenant = await this.tenantsRepository.findOne({
        where: { id },
        relations: ['house']
      });

      if (!tenant) {
        throw new BadRequestException('租客不存在');
      }

      // 如果更换了房屋
      if (updateTenantDto.houseId && updateTenantDto.houseId !== tenant.house?.id) {
        // 将原房屋状态改为可租
        if (tenant.house) {
          await this.houseRepository.update(tenant.house.id, { status: 'available' });
        }

        // 查找新房屋
        const newHouse = await this.houseRepository.findOne({
          where: { id: updateTenantDto.houseId }
        });

        if (!newHouse) {
          throw new BadRequestException('新房屋不存在');
        }

        // 更新新房屋状态为已租
        await this.houseRepository.update(newHouse.id, { status: 'rented' });
      }

      // 更新租客信息
      await this.tenantsRepository.update(id, updateTenantDto);
      
      // 返回更新后的完整数据
      return await this.tenantsRepository.findOne({
        where: { id },
        relations: ['house']
      });
    } catch (error) {
      throw new BadRequestException('更新租客信息失败：' + error.message);
    }
  }

  async findAll() {
    try {
      return await this.tenantsRepository.find({
        relations: ['house'],
      });
    } catch (error) {
      throw new BadRequestException('获取租客列表失败：' + error.message);
    }
  }

  async findOne(id: number) {
    const tenant = await this.tenantsRepository.findOne({
      where: { id },
      relations: ['house'],
    });
    if (!tenant) {
      throw new NotFoundException('未找到该租客信息');
    }
    return tenant;
  }

  async remove(id: number): Promise<void> {
    try {
      const tenant = await this.tenantsRepository.findOne({
        where: { id },
        relations: ['house']
      });

      if (!tenant) {
        throw new BadRequestException('租客不存在');
      }

      // 将房屋状态改为可租
      if (tenant.house) {
        await this.houseRepository.update(tenant.house.id, { status: 'available' });
      }

      await this.tenantsRepository.remove(tenant);
    } catch (error) {
      throw new BadRequestException('删除租客失败：' + error.message);
    }
  }
}
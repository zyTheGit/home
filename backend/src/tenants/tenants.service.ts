import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { House } from '../houses/entities/house.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { User } from '../users/entities/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantsRepository: Repository<Tenant>,
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

    // 检查手机号是否已存在用户
    const existingUser = await this.userRepository.findOne({
      where: { phone: createTenantDto.phone }
    });

    if (!existingUser) {
      try {
        // 处理日期格式
        const tenantData = {
          ...createTenantDto,
          startDate: new Date(createTenantDto.startDate),
          endDate: createTenantDto.endDate ? new Date(createTenantDto.endDate) : null
        };

        // 更新房屋状态为已租
        await this.houseRepository.update(house.id, { status: 'rented' });

        const tenant = this.tenantsRepository.create(tenantData);
        tenant.house = house;

        // 保存租客信息
        const savedTenant = await this.tenantsRepository.save(tenant);

        // 创建新用户时设置 tenantId
        const password = createTenantDto.phone.slice(-6);
        const user = this.userRepository.create({
          phone: createTenantDto.phone,
          password: password,
          name: createTenantDto.name,
          role: 'user',
        });

        await this.userRepository.save(user);
        this.logger.log(`Created new user for tenant: ${createTenantDto.name}`);

        // 返回包含房屋信息的完整数据
        return await this.tenantsRepository.findOne({
          where: { id: savedTenant.id },
          relations: ['house']
        });
      } catch (error) {
        this.logger.error(`Failed to create user for tenant: ${error.message}`);
        throw new BadRequestException(`创建用户账号失败: ${error.message}`);
      }
    }

    try {
      // 处理日期格式
      const tenantData = {
        ...createTenantDto,
        startDate: new Date(createTenantDto.startDate),
        endDate: createTenantDto.endDate ? new Date(createTenantDto.endDate) : null
      };

      // 更新房屋状态为已租
      await this.houseRepository.update(house.id, { status: 'rented' });

      const tenant = this.tenantsRepository.create(tenantData);
      tenant.house = house;

      // 保存租客信息
      const savedTenant = await this.tenantsRepository.save(tenant);

      // 返回包含房屋信息的完整数据
      return await this.tenantsRepository.findOne({
        where: { id: savedTenant.id },
        relations: ['house']
      });
    } catch (error) {
      this.logger.error(`Failed to create tenant: ${error.message}`);
      throw new BadRequestException(`创建租客失败: ${error.message}`);
    }
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
        // 将原房屋状态改为可租，并清除租户关系
        if (tenant.house) {
          await this.houseRepository.update(tenant.house.id, { 
            status: 'available',
            tenant: null  // 清除原房屋的租户关系
          });
        }

        // 查找新房屋
        const newHouse = await this.houseRepository.findOne({
          where: { id: updateTenantDto.houseId }
        });

        if (!newHouse) {
          throw new BadRequestException('新房屋不存在');
        }

        // 更新新房屋状态和租户关系
        await this.houseRepository.update(newHouse.id, { 
          status: 'rented',
          tenant: tenant  // 建立新房屋和租户的关系
        });
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

  async findOne(id: number, userId?: number) {
    try {
      const tenant = await this.tenantsRepository.findOne({
        where: { id },
        relations: ['house', 'payments']
      });

      if (!tenant) {
        throw new NotFoundException('租客信息不存在');
      }

      // // 如果是普通用户，验证是否为当前用户的租客信息
      // if (userId && tenant.id !== userId) {
      //   throw new UnauthorizedException('无权访问该租客信息');
      // }

      // 如果是普通用户，只返回必要信息
      if (userId) {
        const { payments, ...basicInfo } = tenant;
        return basicInfo;
      }

      return tenant;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('获取租客信息失败');
    }
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
        await this.houseRepository.update(tenant.house.id, { 
          status: 'available',
          tenant: null
        });
      }

      await this.tenantsRepository.remove(tenant);
    } catch (error) {
      throw new BadRequestException('删除租客失败：' + error.message);
    }
  }
}
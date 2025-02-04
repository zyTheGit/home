import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
  ) {}

  create(createTenantDto: CreateTenantDto) {
    const tenant = this.tenantsRepository.create(createTenantDto);
    return this.tenantsRepository.save(tenant);
  }

  findAll() {
    return this.tenantsRepository.find({
      relations: ['house'],
    });
  }

  findOne(id: number) {
    return this.tenantsRepository.findOne({
      where: { id },
      relations: ['house'],
    });
  }

  update(id: number, updateTenantDto: UpdateTenantDto) {
    return this.tenantsRepository.update(id, updateTenantDto);
  }

  remove(id: number) {
    return this.tenantsRepository.delete(id);
  }
} 
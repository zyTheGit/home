import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { House } from './entities/house.entity';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

@Injectable()
export class HousesService {
  constructor(
    @InjectRepository(House)
    private readonly houseRepository: Repository<House>,
  ) {}

  async create(createHouseDto: CreateHouseDto): Promise<House> {
    const house = this.houseRepository.create(createHouseDto);
    return await this.houseRepository.save(house);
  }

  async findAll(): Promise<House[]> {
    return await this.houseRepository.find({
      relations: ['tenants']
    });
  }

  async findOne(id: number): Promise<House> {
    const house = await this.houseRepository.findOne({
      where: { id },
      relations: ['tenants', 'payments']
    });
    
    if (!house) {
      throw new NotFoundException(`房源 #${id} 不存在`);
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
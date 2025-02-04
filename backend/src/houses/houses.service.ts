import { Injectable } from '@nestjs/common';
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

  async findAll(): Promise<House[]> {
    return await this.houseRepository.find();
  }

  async findOne(id: number): Promise<House> {
    return await this.houseRepository.findOne({ where: { id } });
  }

  async create(createHouseDto: CreateHouseDto): Promise<House> {
    const house = this.houseRepository.create(createHouseDto);
    return await this.houseRepository.save(house);
  }

  async update(id: number, updateHouseDto: UpdateHouseDto): Promise<House> {
    await this.houseRepository.update(id, updateHouseDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<House> {
    const house = await this.findOne(id);
    return await this.houseRepository.remove(house);
  }
} 
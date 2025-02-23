import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from "@nestjs/common";
import { HousesService } from "./houses.service";
import { CreateHouseDto } from "./dto/create-house.dto";
import { UpdateHouseDto } from "./dto/update-house.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("houses")
@UseGuards(JwtAuthGuard)
export class HousesController {
  constructor(private readonly housesService: HousesService) {}

  @Post()
  create(@Body() createHouseDto: CreateHouseDto) {
    return this.housesService.create(createHouseDto);
  }

  @Get()
  findAll() {
    return this.housesService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req) {
    const userId = req.user.role === "user" ? req.user.id : undefined;
    return await this.housesService.findOne(+id, userId);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateHouseDto: UpdateHouseDto) {
    return this.housesService.update(+id, updateHouseDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.housesService.remove(+id);
  }
}

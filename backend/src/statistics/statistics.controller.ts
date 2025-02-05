import { Controller, Get, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  async getOverview() {
    return await this.statisticsService.getOverview();
  }

  @Get('monthly')
  async getMonthlyStats() {
    return await this.statisticsService.getMonthlyStats();
  }
} 
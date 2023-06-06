import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BasePaginationRequestDto } from 'src/shares/dtos/base-pagination.dto';
import { Response } from 'src/shares/response/response.interface';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { StatisticService } from './statistic.service';

@Controller('statistic')
@ApiTags('Statistic')
@ApiBearerAuth()
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}
  @Get('/transaction')
  @UseGuards(AdminModAuthGuard)
  async getTransactions(
    @Query() options: BasePaginationRequestDto,
  ): Promise<Response> {
    return this.statisticService.getTransactions(options);
  }

  @Get('/systems')
  @UseGuards(AdminModAuthGuard)
  async getInfoSystem(): Promise<Response> {
    return this.statisticService.getInfoSystem();
  }

  @Get('/chart')
  @UseGuards(AdminModAuthGuard)
  async getChart(): Promise<Response> {
    return this.statisticService.getChartCourse();
  }
}

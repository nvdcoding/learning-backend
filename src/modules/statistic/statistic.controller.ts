import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BasePaginationRequestDto } from 'src/shares/dtos/base-pagination.dto';
import { Response } from 'src/shares/response/response.interface';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { StatisticService } from './statistic.service';

@Controller('statistic')
@ApiTags('Statistic')
@ApiBearerAuth()
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}
  @Get('/transaction')
  @UseGuards(AdminAuthGuard)
  async getTransactions(
    @Query() options: BasePaginationRequestDto,
  ): Promise<Response> {
    return this.statisticService.getTransactions(options);
  }

  @Get('/systems')
  @UseGuards(AdminAuthGuard)
  async getInfoSystem(): Promise<Response> {
    return this.statisticService.getInfoSystem();
  }

  @Get('/chart')
  // @UseGuards(AdminAuthGuard)
  async getChart(): Promise<Response> {
    return this.statisticService.getChartCourse();
  }
}

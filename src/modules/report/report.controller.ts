import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { PermissionLevel } from 'src/shares/decorators/level-permission.decorator';
import { Response } from 'src/shares/response/response.interface';
import { AdminService } from '../admin/admin.service';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';

import { GetReportDto } from './dtos/get-report.dto';
import { HandleReportPostDto } from './dtos/handle-report-post.dto';
import { ReportPostDto } from './dtos/report-post.dto';
import { ReportService } from './report.service';

@Controller('reports')
@ApiTags('Report')
@ApiBearerAuth()
export class ReportController {
  constructor(
    private readonly reportService: ReportService,
    private readonly adminService: AdminService,
  ) {}

  @Post('/post')
  @UseGuards(UserAuthGuard)
  async createPostReport(
    @Body() body: ReportPostDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.reportService.reportPost(body, userId);
  }

  @Get('/admin/post')
  @UseGuards(AdminModAuthGuard)
  async getReportPost(
    @Query() options: GetReportDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { report: true });
    return this.reportService.getReportPost(options);
  }

  @Put('/admin/post')
  @UseGuards(AdminModAuthGuard)
  async handleReportPost(
    @Body() body: HandleReportPostDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { report: true });
    return this.reportService.handleReportPost(body);
  }
}

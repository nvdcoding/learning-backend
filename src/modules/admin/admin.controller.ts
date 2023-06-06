import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionLevel } from 'src/shares/decorators/level-permission.decorator';
import { Response } from 'src/shares/response/response.interface';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { AdminService } from './admin.service';
import { ActiveAdminDto } from './dtos/active-admin.dto';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { GetListAdminDto } from './dtos/get-list-admin.dto';
import { AdminUpdateMod } from './dtos/update-mod.dto';

@Controller('admin')
@ApiTags('Admins')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/')
  @UseGuards(AdminAuthGuard)
  async createAccount(
    @Body() body: CreateAdminDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { mod: true });
    return this.adminService.createAccount(body);
  }

  @Post('/active-admin')
  async activeAdmin(
    @Body() body: ActiveAdminDto,
    // @PermissionLevel() level: number,
  ): Promise<Response> {
    // await this.adminService.checkPermission(level, { mod: true });
    return this.adminService.activeAccount(body);
  }

  @Get('/')
  @UseGuards(AdminModAuthGuard)
  async getAdmins(
    @Query() options: GetListAdminDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { mod: true });
    return this.adminService.getListAdmin(options);
  }

  @Delete('/:id')
  @UseGuards(AdminAuthGuard)
  async deleteAdmin(
    @Param('id') id: number,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { mod: true });
    return this.adminService.deleteModAccount(id);
  }

  @Put('/')
  @UseGuards(AdminAuthGuard)
  async updateMod(
    @Body() body: AdminUpdateMod,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { mod: true });
    return this.adminService.updateMod(body);
  }
}

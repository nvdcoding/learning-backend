import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { PermissionService } from './permission.service';

@Controller('permissions')
@ApiTags('Permission')
@ApiBearerAuth()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}
  @Post('/gen-permission')
  @UseGuards(AdminAuthGuard)
  async getPermission() {
    return this.permissionService.genLevelPermission();
  }
}

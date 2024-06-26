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
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { PermissionLevel } from 'src/shares/decorators/level-permission.decorator';
import { BasePaginationRequestDto } from 'src/shares/dtos/base-pagination.dto';
import { Response } from 'src/shares/response/response.interface';
import { AdminService } from '../admin/admin.service';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';
import { AdminChangeStatusUserDto } from './dtos/change-user-status.dto';
import { DepositDto } from './dtos/deposit.dto';
import { AdminGetUsersDto } from './dtos/get-list-user.dto';
import { GetTransactionDto } from './dtos/get-transaction.dto';
import { SearchDto } from './dtos/search.dto';
import { UpdateInforDto } from './dtos/update-info.dto';
import { UserPreferDto } from './dtos/update-user-setting.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly adminService: AdminService,
  ) {}

  @Get('/ipn')
  async webhookIPN(@Query() query) {
    return this.userService.IPNUrl(query);
  }

  @Get('/me')
  @UseGuards(UserAuthGuard)
  async getMe(@UserID() userId: number): Promise<Response> {
    return this.userService.getMe(userId);
  }

  @Put('/prefer')
  @UseGuards(UserAuthGuard)
  async updateUserPrefer(
    @Body() body: UserPreferDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.userService.updateUserPrefer(body, userId);
  }

  @Post('/deposit')
  @UseGuards(UserAuthGuard)
  async genUrlPay(
    @Body() body: DepositDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.userService.genUrlPay(body, userId);
  }

  @Get('/post')
  @UseGuards(UserAuthGuard)
  async getUserPost(
    @Query() options: BasePaginationRequestDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.userService.getUserPost(options, userId);
  }

  @Put('/')
  @UseGuards(AdminModAuthGuard)
  async changeStatusUser(
    @Body() body: AdminChangeStatusUserDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { user: true });
    return this.userService.changeUserStatus(body);
  }

  @Put('/profile')
  @UseGuards(UserAuthGuard)
  async updateInformation(
    @Body() body: UpdateInforDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.userService.updateUserInfo(body, userId);
  }

  @Get('/')
  @UseGuards(AdminModAuthGuard)
  async getListUser(
    @Query() options: AdminGetUsersDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { user: true });
    return this.userService.getListUser(options);
  }

  @Get('/search')
  async search(@Query() options: SearchDto): Promise<Response> {
    return this.userService.search(options);
  }

  @Delete('/:id')
  @UseGuards(AdminModAuthGuard)
  async deleteUser(
    @Param('id') userId: number,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { user: true });
    return this.userService.deleteUser(userId);
  }

  @Get('/transaction')
  @UseGuards(UserAuthGuard)
  async getTransaction(
    @Query() options: GetTransactionDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.userService.getUserTransaction(options, userId);
  }
}

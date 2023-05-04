import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { Response } from 'src/shares/response/response.interface';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';
import { DepositDto } from './dtos/deposit.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/ipn')
  async webhookIPN(@Query() query) {
    return this.userService.IPNUrl(query);
  }

  @Get('/me')
  @UseGuards(UserAuthGuard)
  async getMe(@UserID() userId: number): Promise<Response> {
    return this.userService.getMe(userId);
  }

  @Post('/deposit')
  @UseGuards(UserAuthGuard)
  async genUrlPay(
    @Body() body: DepositDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.userService.genUrlPay(body, userId);
  }
}

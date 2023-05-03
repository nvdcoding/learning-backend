import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
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

  @Get('/')
  async test() {
    console.log(123123);
  }

  @Post('/')
  @UseGuards(UserAuthGuard)
  async genUrlPay(
    @Body() body: DepositDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.userService.genUrlPay(body, userId);
  }
}

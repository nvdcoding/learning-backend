import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DepositDto } from './dtos/deposit.dto';
import { UserService } from './user.service';

@Controller('users')
@ApiTags('User')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get('/')
  // async getAllCourses(): Promise<Response> {
  //   return this.courseService.getAllCourses();
  // }
  @Post('/')
  async deposit(@Body() body: DepositDto, @Req() req) {
    return this.userService.deposit(body, req);
  }

  // }
  @Post('/test')
  async test(@Req() req) {
    return this.userService.test(req);
  }
}

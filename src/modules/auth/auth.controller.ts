import { Body, Controller, Delete, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'src/shares/response/response.interface';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ResendEmailRegisterDto } from './dto/resend-confirmation.dto';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() body: RegisterDto): Promise<Response> {
    return this.authService.register(body);
  }

  @Post('/resend-confirmation-email')
  async resendConfirmationEmail(
    body: ResendEmailRegisterDto,
  ): Promise<Response> {
    return this.authService.resendRegisterEmail(body);
  }

  // @Put('/active-user/:token')
  // async activeUser(@Param('token') token: string): Promise<Response> {

  // }
}

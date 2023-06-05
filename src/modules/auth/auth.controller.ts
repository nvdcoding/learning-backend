import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { Response } from 'src/shares/response/response.interface';
import { AuthService } from './auth.service';
import { ActiveUserDto } from './dto/active-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto copy';
import { CreateAdminDto } from './dto/create-admin.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { AdminLoginDto, LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendEmailRegisterDto } from './dto/resend-confirmation.dto';
import { SendOtpForgotPasswordDto } from './dto/send-otp-forgot-password.dto';
import { UserAuthGuard } from './guard/user-auth.guard';

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

  @Put('/active-user/:token')
  async activeUser(
    @Param('token') token: string,
    @Body() body: ActiveUserDto,
  ): Promise<Response> {
    return this.authService.activeAccount(token, body.email);
  }

  @Post('/login')
  async login(@Body() body: LoginDto): Promise<Response> {
    return this.authService.userLogin(body);
  }

  @Post('/admin-login')
  async adminLogin(@Body() body: AdminLoginDto): Promise<Response> {
    return this.authService.adminLogin(body);
  }

  @Post('/create-admin')
  async createAdmin(@Query() query: CreateAdminDto) {
    return this.authService.createAdmin(query.username, query.password);
  }

  @Post('/send-otp-forgot-password')
  async sendOtpForgotPassword(
    @Body() body: SendOtpForgotPasswordDto,
  ): Promise<Response> {
    return this.authService.sendOtpForgotPassword(body);
  }

  @Post('/forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto): Promise<Response> {
    return this.authService.forgotPassword(body);
  }
  @Put('/change-password')
  @UseGuards(UserAuthGuard)
  async changePassword(
    @Body() body: ChangePasswordDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.authService.changePassword(body, userId);
  }
}

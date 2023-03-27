import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { MailService } from '../mail/mail.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
@Module({
  imports: [MailModule],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}

import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import { RegisterEmailDto } from './dto/register-email.dto';
import { CreateAdminDto } from './dto/send-create-admin-email.dto';

@Injectable()
export class MailService {
  constructor(@InjectQueue('mail') private readonly emailQueue: Queue) {}

  async sendRegisterMail(registerDto: RegisterEmailDto): Promise<void> {
    await this.emailQueue.add('sendRegisterMail', {
      ...registerDto,
    });
  }

  async sendCreateAdmin(createAdminDto: CreateAdminDto): Promise<void> {
    await this.emailQueue.add('sendCreateAdminMail', {
      ...createAdminDto,
    });
  }
}

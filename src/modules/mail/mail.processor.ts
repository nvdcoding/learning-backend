import { MailerService } from '@nestjs-modules/mailer';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { emailConfig } from 'src/configs/email.config';
import { RegisterEmailDto } from './dto/register-email.dto';
import { CreateAdminDto } from './dto/send-create-admin-email.dto';
//import * as moment from 'moment';

@Processor('mail')
export class MailProcessor {
  //   public static MAIL_BANNER_LINK = `${getConfig().get<string>('mail.domain')}banner.png`;

  constructor(
    private readonly mailerService: MailerService,
    private readonly logger: Logger,
  ) {}

  @Process('sendRegisterMail')
  async sendRegisterMail({ data }: Job<RegisterEmailDto>): Promise<number> {
    this.logger.log(
      `Start job: sendUpdateEmail user ${data.username} email ${data.email}`,
    );
    const context = {
      email: data.email,
      confirmLink: data.confirmLink,
      username: data.username,
    };
    try {
      await this.mailerService.sendMail({
        from: emailConfig.from,
        to: data.email,
        subject: `Xác nhận đăng ký KLearnIt`,
        template: `src/modules/mail/templates/register.template.hbs`,
        context: context,
      });
    } catch (e) {
      this.logger.debug(e);
    }
    this.logger.log(
      `Done job: sendUpdateEmail ${data.email} email ${data.username}`,
    );
    return 1;
  }

  @Process('sendCreateAdminMail')
  async sendCreateAdminMail({ data }: Job<CreateAdminDto>): Promise<number> {
    this.logger.log(
      `Start job: sendCreateAdminMail user ${data.username} email ${data.email}`,
    );
    const context = {
      email: data.email,
      url: data.url,
      username: data.username,
    };
    try {
      await this.mailerService.sendMail({
        from: emailConfig.from,
        to: data.email,
        subject: `Tạo tài khoản KlearnIt`,
        template: `src/modules/mail/templates/create-admin.template.hbs`,
        context: context,
      });
    } catch (e) {
      this.logger.debug(e);
    }
    this.logger.log(
      `Done job: sendUpdateEmail ${data.email} email ${data.username}`,
    );
    return 1;
  }
}

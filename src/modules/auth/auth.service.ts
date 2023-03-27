import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from 'src/models/repositories/user.repository';
import { httpErrors } from 'src/shares/exceptions';
import { RegisterDto } from './dto/register.dto';
import { v4 as uuidv4 } from 'uuid';
import { Cache } from 'cache-manager';
import { Response } from 'src/shares/response/response.interface';
import { httpResponse } from 'src/shares/response';
import { emailConfig } from 'src/configs/email.config';
import { MailService } from '../mail/mail.service';
import { UserStatus } from 'src/shares/enum/user.enum';
import { In, Not } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { authConfig } from 'src/configs/auth.config';
import { ResendEmailRegisterDto } from './dto/resend-confirmation.dto';

@Injectable()
export class AuthService {
  static DEFAULT_7DAY_MS = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly userRepository: UserRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailService: MailService,
  ) {}

  async register(body: RegisterDto): Promise<Response> {
    const { email, username, password } = body;
    const [token, user] = await Promise.all([
      this.cacheManager.get(`register-${email}`),
      this.userRepository.findOne({
        where: {
          email,
          username,
          verifyStatus: In([UserStatus.ACTIVE, UserStatus.LOCKED]),
        },
      }),
    ]);
    if (user) {
      throw new HttpException(httpErrors.USER_EXIST, HttpStatus.BAD_REQUEST);
    }
    if (token) {
      throw new HttpException(
        httpErrors.WAIT_TO_RESEND,
        HttpStatus.BAD_REQUEST,
      );
    }
    const newTtoken = uuidv4();
    const passwordHash = await bcrypt.hash(password, +authConfig.salt);
    await Promise.all([
      this.cacheManager.set(`register-${email}`, newTtoken, {
        ttl: emailConfig.registerTTL,
      }),
      this.userRepository.insert({ ...body, password: passwordHash }),
    ]);
    await this.mailService.sendRegisterMail({
      email: body.email,
      username: body.username,
      confirmLink: `${newTtoken}`,
    });
    return httpResponse.REGISTER_SEND_MAIL;
  }

  async resendRegisterEmail(body: ResendEmailRegisterDto): Promise<Response> {
    const { email } = body;
    const [token, user] = await Promise.all([
      this.cacheManager.get(`register-${email}`),
      this.userRepository.findOne({
        where: {
          email: body.email,
          verifyStatus: UserStatus.INACTIVE,
        },
      }),
    ]);

    if (token) {
      throw new HttpException(
        httpErrors.WAIT_TO_RESEND,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const newToken = uuidv4();
    await this.cacheManager.set(`register-${email}`, newToken, {
      ttl: emailConfig.registerTTL,
    });
    await this.mailService.sendRegisterMail({
      email: body.email,
      username: user.username,
      confirmLink: `${newToken}`,
    });
    return httpResponse.REGISTER_SEND_MAIL;
  }

  // async activeAccount(token: string, email: string): Promise<Response> {
  //   const [checkToken, user] = await Promise.all([
  //     this.cacheManager.get(`register-${email}`),
  //     this.userRepository.findOne({
  //       where: {
  //         email,
  //         verifyStatus: UserStatus.INACTIVE,
  //       },
  //     }),
  //   ]);

  //   if (token) {
  //     throw new HttpException(
  //       httpErrors.WAIT_TO_RESEND,
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }
  //   if (!user) {
  //     throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
  //   }
  //   return httpResponse.REGISTER_SEND_MAIL;
  // }
}

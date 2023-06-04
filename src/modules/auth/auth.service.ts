import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
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
import * as bcrypt from 'bcrypt';
import { authConfig } from 'src/configs/auth.config';
import { ResendEmailRegisterDto } from './dto/resend-confirmation.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { IJwtAdminPayload, IJwtPayload } from './interfaces/payload.interface';
import { AdminRepository } from 'src/models/repositories/admin.repository';
import { Role, AdminStatus, AdminRole } from 'src/shares/enum/admin.enum';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AuthService {
  static DEFAULT_7DAY_MS = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly adminRepositoty: AdminRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: RegisterDto): Promise<Response> {
    const { email, username, password } = body;
    const [token, user] = await Promise.all([
      this.cacheManager.get(`register-${email}`),
      this.userRepository.findOne({
        where: {
          email,
          username,
        },
      }),
    ]);
    if (
      user &&
      [UserStatus.ACTIVE, UserStatus.LOCKED].includes(user.verifyStatus)
    ) {
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
    if (!user) {
      await this.userRepository.insert({ ...body, password: passwordHash });
    }
    await Promise.all([
      this.cacheManager.set(`register-${email}`, newTtoken, {
        ttl: emailConfig.registerTTL,
      }),
      this.mailService.sendRegisterMail({
        email: body.email,
        username: body.username,
        confirmLink: `${newTtoken}`,
      }),
    ]);
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

  async activeAccount(token: string, email: string): Promise<Response> {
    const [checkToken, user] = await Promise.all([
      this.cacheManager.get(`register-${email}`),
      this.userRepository.findOne({
        where: {
          email,
          verifyStatus: UserStatus.INACTIVE,
        },
      }),
    ]);

    if (!checkToken) {
      throw new HttpException(
        httpErrors.REGISTER_TOKEN_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (token !== checkToken) {
      throw new HttpException(
        httpErrors.REGISTER_TOKEN_NOT_MATCH,
        HttpStatus.BAD_REQUEST,
      );
    }
    await Promise.all([
      this.userRepository.update(
        { email: email },
        { verifyStatus: UserStatus.ACTIVE },
      ),
      this.cacheManager.del(`register-${email}`),
    ]);
    return httpResponse.REGISTER_SUCCESS;
  }

  async userLogin(body: LoginDto) {
    const { email, password } = body;

    const userExisted = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'verifyStatus', 'password'],
    });

    if (!userExisted)
      throw new HttpException(
        httpErrors.USER_LOGIN_FAIL,
        HttpStatus.BAD_REQUEST,
      );

    if (
      [UserStatus.INACTIVE, UserStatus.LOCKED].includes(
        userExisted.verifyStatus,
      )
    )
      throw new HttpException(
        httpErrors.USER_NOT_ACTIVE,
        HttpStatus.BAD_REQUEST,
      );

    const comparePassword = await bcrypt.compare(
      password,
      userExisted.password,
    );

    if (!comparePassword)
      throw new HttpException(
        httpErrors.USER_LOGIN_FAIL,
        HttpStatus.BAD_REQUEST,
      );

    const { refreshJwt } = authConfig;
    const payload = {
      id: userExisted.id,
      email,
      verifyStatus: userExisted.verifyStatus,
      isSetup: userExisted.isSetup,
    } as IJwtPayload;

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshJwt,
      expiresIn: '7d',
    });
    return {
      ...httpResponse.LOGIN_SUCCESS,
      data: {
        accessToken,
        refreshToken,
      },
    };
  }

  async createAdmin(username: string, password: string): Promise<void> {
    const admin = await this.adminRepositoty.findOne({ username });
    if (admin) {
      throw new Error('Admin found');
    }
    const passwordHash = await bcrypt.hash(password, +authConfig.salt);
    await this.adminRepositoty.insert({
      username,
      password: passwordHash,
      role: AdminRole.ADMIN,
      status: AdminStatus.ACTIVE,
    });
  }

  async adminLogin(body: CreateAdminDto): Promise<Response> {
    const { username, password } = body;

    const adminExisted = await this.adminRepositoty.findOne({
      where: { username },
      select: ['id', 'username', 'role', 'password', 'permission'],
      relations: ['permission'],
    });
    if (!adminExisted)
      throw new HttpException(
        httpErrors.ADMIN_LOGIN_FAIL,
        HttpStatus.BAD_REQUEST,
      );

    if ([AdminStatus.INACTIVE].includes(adminExisted.status))
      throw new HttpException(
        httpErrors.ADMIN_NOT_ACTIVE,
        HttpStatus.BAD_REQUEST,
      );

    const comparePassword = await bcrypt.compare(
      password,
      adminExisted.password,
    );

    if (!comparePassword)
      throw new HttpException(
        httpErrors.USER_LOGIN_FAIL,
        HttpStatus.BAD_REQUEST,
      );

    const { refreshJwt } = authConfig;
    const payload = {
      id: adminExisted.id,
      role: adminExisted.role,
      status: adminExisted.status,
      username: adminExisted.username,
      level: adminExisted.permission.level,
    } as IJwtAdminPayload;

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshJwt,
      expiresIn: '7d',
    });
    return {
      ...httpResponse.LOGIN_SUCCESS,
      data: {
        accessToken,
        refreshToken,
      },
    };
  }
}

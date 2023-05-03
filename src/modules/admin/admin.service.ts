import {
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { emailConfig } from 'src/configs/email.config';
import { AdminRepository } from 'src/models/repositories/admin.repository';
import { PermissionRepository } from 'src/models/repositories/permission.repository';
import { AdminStatus } from 'src/shares/enum/admin.enum';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { In } from 'typeorm';
import { MailService } from '../mail/mail.service';
import { CreateAdminDto } from './dtos/create-admin.dto';
import { Cache } from 'cache-manager';

@Injectable()
export class AdminService {
  constructor(
    private readonly adminRepository: AdminRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly permissionRepository: PermissionRepository,
  ) {}
  async getAdminByIdAndUsername(id: number, username: string) {
    return this.adminRepository.findOne({
      where: {
        id,
        username,
      },
    });
  }
  // async createAccount(body: CreateAdminDto): Promise<Response> {
  //   const { username, email, role } = body;
  //   const admin = await this.adminRepository.findOne({
  //     where: [{ username }, { email }],
  //   });
  //   if (admin) {
  //     throw new HttpException(httpErrors.ADMIN_EXIST, HttpStatus.BAD_REQUEST);
  //   }
  //   const payload = {
  //     email,
  //     role,
  //     username,
  //   };
  //   const token = this.jwtService.sign(payload, { expiresIn: '1h' });
  //   const [cacheData, permissions] = await Promise.all([
  //     this.cacheManager.set(`create-admin-${email}`, token, {
  //       ttl: emailConfig.registerTTL,
  //     }),
  //     this.permissionRepository.find({ where: { level: In([1, 4]) } }),
  //   ]);
  //   await Promise.all([
  //     this.mailService.sendCreateAdmin({
  //       email: email,
  //       username: username,
  //       url: `${siteConfig.url}/active-tai-khoan/${token}`,
  //     }),
  //     this.adminRepository.insert({
  //       ...body,
  //       status: AdminStatus.INACTIVE,
  //       role,
  //       permission:
  //         role === AdminRole.ADMIN
  //           ? permissions.filter((e) => e.level === 1)[0]
  //           : permissions.filter((e) => e.level === 4)[0],
  //     }),
  //   ]);
  //   return httpResponse.CREATE_ADMIN_SUCCESS;
  // }
}

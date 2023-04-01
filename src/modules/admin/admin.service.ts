import { Injectable } from '@nestjs/common';
import { AdminRepository } from 'src/models/repositories/admin.repository';

@Injectable()
export class AdminService {
  constructor(private readonly adminRepository: AdminRepository) {}
  async getAdminByIdAndUsername(id: number, username: string) {
    return this.adminRepository.findOne({
      where: {
        id,
        username,
      },
    });
  }
}

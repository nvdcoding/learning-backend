import { Command, Positional, Option } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminRepository } from 'src/models/repositories/admin.repository';
import { authConfig } from 'src/configs/auth.config';
import { AdminStatus, Role } from 'src/shares/enum/admin.enum';
/// NOT WORK
@Injectable()
export class AuthCommand {
  constructor(private readonly adminRepository: AdminRepository) {}

  @Command({
    command: 'create:admin <username> <password>',
    describe: 'create a admin',
  })
  async create(
    @Positional({
      name: 'username',
      describe: 'the username',
      type: 'string',
    })
    username: string,
    @Positional({
      name: 'password',
      describe: 'the password',
      type: 'string',
    })
    password: string,
  ) {
    const admin = await this.adminRepository.findOne({ username });
    if (admin) {
      throw new Error('Admin found');
    }
    const passwordHash = await bcrypt.hash(password, +authConfig.salt);
    await this.adminRepository.insert({
      username,
      password: passwordHash,
      role: Role.ADMIN,
      status: AdminStatus.ACTIVE,
    });
    return true;
  }
}

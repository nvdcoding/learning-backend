import { HttpException, Injectable } from '@nestjs/common';
import { PermissionRepository } from 'src/models/repositories/permission.repository';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async genLevelPermission() {
    const data = await this.permissionRepository.findOne();
    if (data) {
      throw new HttpException('Data existed', 400);
    }
    const permissions = [
      {
        level: 1,
        post: true,
        report: true,
        user: false,
        exercise: false,
        lesson: false,
        course: false,
      },
      {
        level: 2,
        post: true,
        report: true,
        user: true,
        exercise: false,
        lesson: false,
        course: false,
      },
      {
        level: 3,
        post: true,
        report: true,
        user: true,
        exercise: true,
        lesson: true,
        course: false,
      },
      {
        level: 4,
        post: true,
        report: true,
        user: true,
        exercise: true,
        lesson: true,
        course: true,
      },
    ];
    await this.permissionRepository.save(permissions);
  }
}

import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/models/repositories/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  // async getAllCourses() {
  //   const data = await this.courseRepository.find();
  //   return { ...httpResponse.GET_SUCCES, data };
  // }
  async getUserByIdAndEmail(id: number, email: string) {
    return this.userRepository.findOne({
      where: {
        id,
        email,
      },
    });
  }
}

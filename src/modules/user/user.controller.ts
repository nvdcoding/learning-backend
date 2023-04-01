import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('users')
@ApiTags('User')
@ApiBearerAuth()
export class UserController {
  constructor() {}

  // @Get('/')
  // async getAllCourses(): Promise<Response> {
  //   return this.courseService.getAllCourses();
  // }
}

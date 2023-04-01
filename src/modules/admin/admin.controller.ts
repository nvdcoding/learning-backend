import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@Controller('admin')
@ApiTags('Admins')
@ApiBearerAuth()
export class AdminController {
  constructor() {}

  // @Get('/')
  // async getAllCourses(): Promise<Response> {
  //   return this.courseService.getAllCourses();
  // }
}

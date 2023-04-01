import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'src/shares/response/response.interface';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';

@Controller('courses')
@ApiTags('Course')
@ApiBearerAuth()
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Get('/')
  async getAllCourses(): Promise<Response> {
    return this.courseService.getAllCourses();
  }

  @Get('/:courseId')
  async getOneCourse(@Param('courseId') courseId: number): Promise<Response> {
    return this.courseService.getOneCourse(courseId);
  }

  @Post('/')
  @UseGuards(AdminModAuthGuard)
  async createCourse(@Body() body: CreateCourseDto) {
    return this.courseService.createCourse(body);
  }

  @Put('/:courseId')
  @UseGuards(AdminModAuthGuard)
  async updateCourse(
    @Body() body: UpdateCourseDto,
    @Param('courseId') courseId: number,
  ) {
    return this.courseService.updateCourse(body, courseId);
  }

  @Delete('/:courseId')
  @UseGuards(AdminModAuthGuard)
  async deleteCourse(@Param('courseId') courseId: number) {
    return this.courseService.deleteCourse(courseId);
  }
}

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
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { UserOrGuest } from 'src/shares/decorators/user-or-guest.decorator';
import { Response } from 'src/shares/response/response.interface';
import { AdminAuthGuard } from '../auth/guard/admin-auth.guard';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dtos/create-course.dto';
import { RegisterCourseDto } from './dtos/register-course.dto';
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

  @Get('/prefer')
  @UseGuards(UserAuthGuard)
  async getPreferCourse(@UserID() userId: number): Promise<Response> {
    return this.courseService.getPreferCourse(userId);
  }

  @Get('/user/current')
  @UseGuards(UserAuthGuard)
  async getUserCourse(@UserID() userId: number): Promise<Response> {
    return this.courseService.getUserCourse(userId);
  }

  @Get('/:courseId')
  async getOneCourse(
    @Param('courseId') courseId: number,
    @UserOrGuest() user: number | null,
  ): Promise<Response> {
    return this.courseService.getOneCourse(courseId, user);
  }

  @Post('/')
  @UseGuards(AdminModAuthGuard)
  async createCourse(@Body() body: CreateCourseDto) {
    return this.courseService.createCourse(body);
  }

  @Post('/register')
  @UseGuards(UserAuthGuard)
  async registerCourse(
    @Body() body: RegisterCourseDto,
    @UserID() userId: number,
  ) {
    return this.courseService.registerCourse(body.courseId, userId);
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

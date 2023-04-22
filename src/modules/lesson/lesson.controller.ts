import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'src/shares/response/response.interface';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { IsLoginAuthGuard } from '../auth/guard/is-login.guard';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { GetLessonDto } from './dtos/get-lesson.dto';
import { UpdateLessonDto } from './dtos/update-lesson.dto';
import { LessonService } from './lesson.service';

@Controller('lessons')
@ApiTags('Lesson')
@ApiBearerAuth()
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get('/user')
  @UseGuards(UserAuthGuard)
  async userGetCourseLesson(@Query() query: GetLessonDto): Promise<Response> {
    return this.lessonService.getLessonOfCourse(+query.courseId, 'user');
  }

  @Get('/admin')
  @UseGuards(AdminModAuthGuard)
  async adminGetCourseLesson(@Query() query: GetLessonDto): Promise<Response> {
    return this.lessonService.getLessonOfCourse(+query.courseId, 'admin');
  }

  @Get('/user/:lessonId')
  @UseGuards(IsLoginAuthGuard)
  async GetOneLesson(@Param('lessonId') lessonId: number): Promise<Response> {
    return this.lessonService.getOneLesson(lessonId);
  }

  @Post('/admin')
  @UseGuards(AdminModAuthGuard)
  async createLesson(@Body() body: CreateLessonDto): Promise<Response> {
    return this.lessonService.createLesson(body);
  }

  @Put('/admin')
  @UseGuards(AdminModAuthGuard)
  async updateLesson(@Body() body: UpdateLessonDto): Promise<Response> {
    return this.lessonService.updateLesson(body);
  }
}

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
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { UpdateLessonDto } from './dtos/update-lesson.dto';
import { LessonService } from './lesson.service';

@Controller('lessons')
@ApiTags('Lesson')
@ApiBearerAuth()
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get('/:courseId')
  @UseGuards(IsLoginAuthGuard)
  async getCourseLesson(
    @Param('courseId') courseId: number,
  ): Promise<Response> {
    return this.lessonService.getLessonOfCourse(courseId);
  }

  @Get('/:courseId/:lessonId')
  @UseGuards(IsLoginAuthGuard)
  async GetOneLesson(
    @Param('courseId') courseId: number,
    @Param('lessonId') lessonId: number,
  ): Promise<Response> {
    return this.lessonService.getOneLesson(courseId, lessonId);
  }

  @Post('')
  @UseGuards(AdminModAuthGuard)
  async createLesson(@Body() body: CreateLessonDto): Promise<Response> {
    return this.lessonService.createLesson(body);
  }

  @Put('')
  @UseGuards(AdminModAuthGuard)
  async updateLesson(@Body() body: UpdateLessonDto): Promise<Response> {
    return this.lessonService.updateLesson(body);
  }
}

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
import { PermissionLevel } from 'src/shares/decorators/level-permission.decorator';
import { Response } from 'src/shares/response/response.interface';
import { AdminService } from '../admin/admin.service';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { IsLoginAuthGuard } from '../auth/guard/is-login.guard';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';
import { CreateNoteDto } from './dtos/creaet-note.dto';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { GetLessonDto } from './dtos/get-lesson.dto';
import { UpdateLessonDto } from './dtos/update-lesson.dto';
import { LessonService } from './lesson.service';

@Controller('lessons')
@ApiTags('Lesson')
@ApiBearerAuth()
export class LessonController {
  constructor(
    private readonly lessonService: LessonService,
    private readonly adminService: AdminService,
  ) {}

  @Get('/user')
  @UseGuards(UserAuthGuard)
  async userGetCourseLesson(
    @Query() query: GetLessonDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.lessonService.getLessonOfCourse(
      +query.courseId,
      'user',
      userId,
    );
  }

  @Get('/user/currentLesson/:courseId')
  @UseGuards(UserAuthGuard)
  async getCurrentLesson(
    @Param('courseId') courseId: number,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.lessonService.getCurrentLesson(courseId, userId);
  }

  @Get('/user/:lessonId')
  @UseGuards(UserAuthGuard)
  async userGetOneLesson(
    @Param('lessonId') lessonId: number,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.lessonService.getOneLesson(lessonId, userId);
  }

  @Post('/user/note')
  @UseGuards(UserAuthGuard)
  async userCreateNote(
    @Body() body: CreateNoteDto,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.lessonService.createNote(body, userId);
  }

  @Get('/user/note/:lessonId')
  @UseGuards(UserAuthGuard)
  async getUserNotes(
    @Param('lessonId') lessonId: number,
    @UserID() userId: number,
  ): Promise<Response> {
    return this.lessonService.getLessonNote(lessonId, userId);
  }

  @Delete('/:id')
  @UseGuards(AdminModAuthGuard)
  async deleteLesson(
    @Param('id') id: number,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { lesson: true });
    return this.lessonService.deleteLesson(id);
  }

  @Get('/admin')
  @UseGuards(AdminModAuthGuard)
  async adminGetCourseLesson(
    @Query() query: GetLessonDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { lesson: true });
    return this.lessonService.getLessonOfCourse(+query.courseId, 'admin');
  }

  @Get('/admin/:lessonId')
  @UseGuards(AdminModAuthGuard)
  async adminGetOneLesson(
    @Param('lessonId') lessonId: number,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { lesson: true });
    return this.lessonService.getOneLesson(lessonId);
  }

  @Post('/admin')
  @UseGuards(AdminModAuthGuard)
  async createLesson(
    @Body() body: CreateLessonDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { lesson: true });
    return this.lessonService.createLesson(body);
  }

  @Put('/admin')
  @UseGuards(AdminModAuthGuard)
  async updateLesson(
    @Body() body: UpdateLessonDto,
    @PermissionLevel() level: number,
  ): Promise<Response> {
    await this.adminService.checkPermission(level, { lesson: true });
    return this.lessonService.updateLesson(body);
  }
}

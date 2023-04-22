import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'src/shares/response/response.interface';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';
import { CreateExcerciseDto } from './dtos/create-excercise.dto';
import { ExcerciseService } from './excercise.service';

@Controller('exercises')
@ApiTags('Excercise')
@ApiBearerAuth()
export class ExcerciseController {
  constructor(private readonly excerciseService: ExcerciseService) {}

  // @Get('/:lessonId')
  // async getAllCourses(): Promise<Response> {
  //   // return this.courseService.getAllCourses();
  // }

  @Post('/:lessonId')
  @UseGuards(AdminModAuthGuard)
  async createExcercise(
    @Param('lessonId') lessonId: number,
    @Body() body: CreateExcerciseDto,
  ) {
    return this.excerciseService.createExcercise(lessonId, body);
  }

  @Get('/:lessonId')
  @UseGuards(UserAuthGuard)
  async getExcerciseOfLesson(@Param('lessonId') lessonId: number) {
    return this.excerciseService.getExcercises(lessonId);
  }

  @Get('/:lessonId/:exerciseId')
  @UseGuards(UserAuthGuard)
  async getOneExercise(
    @Param('lessonId') lessonId: number,
    @Param('exerciseId') exerciseId: number,
  ) {
    return this.excerciseService.getExcercises(lessonId);
  }
}

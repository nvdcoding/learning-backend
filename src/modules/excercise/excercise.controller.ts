import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { Response } from 'src/shares/response/response.interface';
import { AdminModAuthGuard } from '../auth/guard/admin-mod-auth-guard';
import { IsLoginAuthGuard } from '../auth/guard/is-login.guard';
import { UserAuthGuard } from '../auth/guard/user-auth.guard';
import { CreateExcerciseDto } from './dtos/create-excercise.dto';
import { GetExerciseDto } from './dtos/get-exercise.dto';
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

  @Post('/')
  @UseGuards(AdminModAuthGuard)
  async createExcercise(@Body() body: CreateExcerciseDto) {
    return this.excerciseService.createExcercise(body.lessonId, body);
  }

  @Get('/admin')
  @UseGuards(AdminModAuthGuard)
  async adminGetExcerciseOfLesson(@Query() query: GetExerciseDto) {
    return this.excerciseService.getExcercises(+query.lessionId);
  }

  @Get('/user')
  @UseGuards(UserAuthGuard)
  async userGetExcerciseOfLesson(
    @Query() query: GetExerciseDto,
    @UserID() userId: number,
  ) {
    return this.excerciseService.getExcercises(+query.lessionId, userId);
  }

  @Get('/user/:exerciseId')
  @UseGuards(UserAuthGuard)
  async userGetOneExercise(
    @Param('exerciseId') exerciseId: number,
    @UserID() userId: number,
  ) {
    return this.excerciseService.getOneExcercise(exerciseId, userId);
  }

  @Get('/admin/:exerciseId')
  @UseGuards(AdminModAuthGuard)
  async adminGetOneExercise(@Param('exerciseId') exerciseId: number) {
    return this.excerciseService.getOneExcercise(exerciseId);
  }
}

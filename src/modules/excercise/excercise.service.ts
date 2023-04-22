import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CourseRepository } from 'src/models/repositories/course.repository';
import { ExcerciseRepository } from 'src/models/repositories/exercise.repository';
import { LessonRepository } from 'src/models/repositories/lesson.repository';
import { TestcaseRepository } from 'src/models/repositories/testcase.repository';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { CreateExcerciseDto } from './dtos/create-excercise.dto';

@Injectable()
export class ExcerciseService {
  constructor(
    private readonly excerciseRepository: ExcerciseRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly testcaseRepository: TestcaseRepository,
  ) {}
  async getExcercises(lessonId: number) {
    const lesson = await this.lessonRepository.findOne(lessonId, {
      relations: ['exercises'],
    });
    if (!lesson) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    return { ...httpResponse.GET_SUCCES, data: lesson };
  }

  async getOneExcercise(exerciseId: number) {
    const exercise = await this.excerciseRepository.findOne({
      where: {
        id: exerciseId,
      },
      relations: ['testCases'],
    });
    if (!exercise) {
      throw new HttpException(
        httpErrors.EXERCISE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    return { ...httpResponse.GET_SUCCES, data: exercise };
  }

  async createExcercise(lessonId: number, body: CreateExcerciseDto) {
    const { question, description, testcases } = body;
    if (!lessonId) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const lesson = await this.lessonRepository.findOne({
      where: {
        id: lessonId,
      },
    });
    if (!lesson) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const exercise = await this.excerciseRepository.save({
      question,
      description,
      lesson,
    });
    const testCases = await this.testcaseRepository.save([
      ...testcases.map((e) => {
        return { ...e, exercise };
      }),
    ]);
    return httpResponse.CREATE_EXCERCISE_SUCCES;
  }
}

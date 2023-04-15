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
  async getExcercises(lessonId: number) {}

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

    const testcase = await this.testcaseRepository.save([...testcases]);
    await this.excerciseRepository.save({
      question,
      description,
      testcase,
      lesson,
    });
    return httpResponse.CREATE_EXCERCISE_SUCCES;
  }
}

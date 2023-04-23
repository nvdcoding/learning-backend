import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ExcerciseRepository } from 'src/models/repositories/exercise.repository';
import { LessonRepository } from 'src/models/repositories/lesson.repository';
import { TestcaseRepository } from 'src/models/repositories/testcase.repository';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { CourseService } from '../course/course.service';
import { CreateExcerciseDto } from './dtos/create-excercise.dto';

@Injectable()
export class ExcerciseService {
  constructor(
    private readonly excerciseRepository: ExcerciseRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly testcaseRepository: TestcaseRepository,
    private readonly courseService: CourseService,
  ) {}
  async getExcercises(lessonId: number, userId?: number) {
    const lesson = await this.lessonRepository.findOne(lessonId, {
      relations: ['exercises'],
    });
    if (!lesson) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }

    if (userId) {
      if (!this.courseService.isHaveCourse(lesson.course.id, userId)) {
        throw new HttpException(
          httpErrors.USER_NOT_ENROLLED_COURSE,
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    return { ...httpResponse.GET_SUCCES, data: lesson.exercises };
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

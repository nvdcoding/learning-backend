import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ExcerciseRepository } from 'src/models/repositories/exercise.repository';
import { LessonRepository } from 'src/models/repositories/lesson.repository';
import { TestcaseRepository } from 'src/models/repositories/testcase.repository';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { CourseService } from '../course/course.service';
import { CreateExcerciseDto } from './dtos/create-excercise.dto';
import { DoExerciseDto } from './dtos/do-exercise.dto';
import { HttpService } from '@nestjs/axios';
import axios from 'axios';
@Injectable()
export class ExcerciseService {
  constructor(
    private readonly excerciseRepository: ExcerciseRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly testcaseRepository: TestcaseRepository,
    private readonly courseService: CourseService,
    private readonly httpService: HttpService,
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

  async getOneExcercise(exerciseId: number, userId?: number) {
    const exercise = await this.excerciseRepository.findOne({
      where: {
        id: exerciseId,
      },
      relations: ['testCases', 'lesson', 'lesson.course'],
    });
    if (!exercise) {
      throw new HttpException(
        httpErrors.EXERCISE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (userId) {
      if (!this.courseService.isHaveCourse(exercise.lesson.course.id, userId)) {
        throw new HttpException(
          httpErrors.USER_NOT_ENROLLED_COURSE,
          HttpStatus.BAD_REQUEST,
        );
      }
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

  async doExercise(body: DoExerciseDto, userId: number): Promise<void> {
    const exercise = await this.excerciseRepository.findOne({
      where: {
        id: body.exerciseId,
      },
      relations: ['testCases', 'lesson', 'lesson.course'],
    });
    if (!exercise) {
      throw new HttpException(
        httpErrors.EXERCISE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (!this.courseService.isHaveCourse(exercise.lesson.course.id, userId)) {
      throw new HttpException(
        httpErrors.USER_NOT_ENROLLED_COURSE,
        HttpStatus.BAD_REQUEST,
      );
    }
    for (const testcase of exercise.testCases) {
      const program = {
        script: 'console.log("DUY")',
        language: 'nodejs',
        versionIndex: '0',
        clientId: '4c17b16c1985acfd25d703de8861b2b4',
        clientSecret:
          'eb3eef86c421531a15c833f4a3a44d88234c8905724b12d005adee9651ca8f33',
      };
      try {
        const response: any = await axios.post(
          `https://api.jdoodle.com/v1/execute`,
          program,
        );
        console.log(response.data);

        return response.data.output;
      } catch (error) {
        console.error(error);
        throw new Error('Failed to execute code');
      }
    }
  }
}

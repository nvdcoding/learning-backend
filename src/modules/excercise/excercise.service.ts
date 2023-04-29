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
import { C_BASIC } from 'src/shares/constant/course.constant';
import { Response } from 'src/shares/response/response.interface';
import { UserExerciseRepository } from 'src/models/repositories/user-exercise.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { UserStatus } from 'src/shares/enum/user.enum';
import { UserCourseRepository } from 'src/models/repositories/user-course.repository';
import { LessonService } from '../lesson/lesson.service';
@Injectable()
export class ExcerciseService {
  constructor(
    private readonly excerciseRepository: ExcerciseRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly userExerciseRepository: UserExerciseRepository,
    private readonly testcaseRepository: TestcaseRepository,
    private readonly courseService: CourseService,
    private readonly userRepository: UserRepository,
    private readonly userCourseRepository: UserCourseRepository,
    private readonly lessonService: LessonService,
  ) {}
  async getExcercises(lessonId: number, userId?: number) {
    const lesson = await this.lessonRepository.findOne(lessonId, {
      relations: ['exercises', 'course'],
    });
    if (!lesson) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    let currentLesson;
    if (userId) {
      currentLesson = await this.courseService.isHaveCourse(
        lesson.course.id,
        userId,
      );
      if (currentLesson === null) {
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
    let currentLesson;
    if (userId) {
      currentLesson = await this.courseService.isHaveCourse(
        exercise.lesson.course.id,
        userId,
      );
      if (currentLesson === null) {
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

  async doExercise(body: DoExerciseDto, userId: number): Promise<Response> {
    const [exercise, user] = await Promise.all([
      this.excerciseRepository.findOne({
        where: {
          id: body.exerciseId,
        },
        relations: [
          'testCases',
          'lesson',
          'lesson.course',
          'lesson.course.lessons',
        ],
      }),
      this.userRepository.findOne({
        where: {
          id: userId,
          verifyStatus: UserStatus.ACTIVE,
        },
      }),
    ]);
    console.log({ exercise });
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (!exercise) {
      throw new HttpException(
        httpErrors.EXERCISE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    let currentLesson;
    if (userId) {
      currentLesson = await this.courseService.isHaveCourse(
        exercise.lesson.course.id,
        userId,
      );
      if (currentLesson === null) {
        throw new HttpException(
          httpErrors.USER_NOT_ENROLLED_COURSE,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const userExercise = await this.userExerciseRepository.findOne({
      where: { user, exercise },
    });
    // await this.userExerciseRepository.
    const result = [];
    for (const testcase of exercise.testCases) {
      const program = {
        script: body.answer,
        language: exercise.lesson.course.language,
        versionIndex: '0',
        clientId: '4c17b16c1985acfd25d703de8861b2b4',
        clientSecret:
          'eb3eef86c421531a15c833f4a3a44d88234c8905724b12d005adee9651ca8f33',
        stdin: testcase.input,
      };

      try {
        const { data }: any = await axios.post(
          `https://api.jdoodle.com/v1/execute`,
          program,
        );
        result.push({
          ...testcase,
          status: data.output === testcase.output ? 1 : 0,
          output: data.output,
          expected: testcase.output,
        });
      } catch (error) {
        console.error(error);
        throw new Error('Failed to execute code');
      }
    }
    const check = result.filter((e) => e.status == 1);
    let statusExercise = false;
    if (check.length == exercise.testCases.length) {
      statusExercise = true;
    } else {
      statusExercise = false;
    }
    if (userExercise) {
      await this.userExerciseRepository.update(userExercise.id, {
        answer: body.answer,
        status: statusExercise,
      });
    } else {
      await this.userExerciseRepository.insert({
        exercise,
        user,
        answer: body.answer,
        status: statusExercise,
      });
    }
    if (exercise.lesson.id === currentLesson) {
      const [exercises, completedExercises] = await Promise.all([
        this.excerciseRepository.find({
          where: {
            lesson: {
              id: exercise.lesson.id,
            },
          },
        }),
        this.userExerciseRepository
          .createQueryBuilder('userExercise')
          .leftJoin('userExercise.exercise', 'exercise')
          .leftJoin('exercise.lesson', 'lesson')
          .select('COUNT(userExercise.id)', 'count')
          .where('userExercise.user_id = :user', { user: userId })
          .andWhere('lesson.id = :lessonId', { lessonId: exercise.lesson.id })
          .andWhere('userExercise.status = :status', { status: true })
          .getRawOne(),
      ]);

      if (+exercises.length === +completedExercises.count) {
        const { nextLesson } =
          await this.lessonService.getPreviousAndNextLesson(exercise.lesson);
        console.log({ nextLesson });
        await this.userCourseRepository.update(
          { user: user, course: exercise.lesson.course },
          { currentLesson: nextLesson ? nextLesson.id : exercise.lesson.id },
        );
      }
    }

    return { ...httpResponse.ADMIN_LOGIN_SUCCESS, data: result };
  }
}

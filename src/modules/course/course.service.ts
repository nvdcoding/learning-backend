import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { of } from 'rxjs';
import { Lesson } from 'src/models/entities/lesson.entity';
import { UserCourse } from 'src/models/entities/user-course.entity';
import { CourseRepository } from 'src/models/repositories/course.repository';
import { ExcerciseRepository } from 'src/models/repositories/exercise.repository';
import { LessonRepository } from 'src/models/repositories/lesson.repository';
import { TestcaseRepository } from 'src/models/repositories/testcase.repository';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import { UserCourseRepository } from 'src/models/repositories/user-course.repository';
import { UserExerciseRepository } from 'src/models/repositories/user-exercise.repository';
import { UserLessonRepository } from 'src/models/repositories/user-lesson.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { CourseType, CourseStatus, Path } from 'src/shares/enum/course.enum';
import {
  TransactionStatus,
  TransactionType,
} from 'src/shares/enum/transaction.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { In, Not } from 'typeorm';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly userRepository: UserRepository,
    private readonly userCourseRepository: UserCourseRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly exerciseRepository: ExcerciseRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly userLessonRepository: UserLessonRepository,
    private readonly testcaseRepository: TestcaseRepository,
    private readonly userExerciseRepository: UserExerciseRepository,
  ) {}

  async getAllCourses() {
    const data = await this.courseRepository.find({
      select: [
        'id',
        'name',
        'description',
        'goal',
        'language',
        'level',
        'img',
        'path',
        'requirement',
        'price',
        'type',
        'status',
      ],
      relations: ['userCourses'],
    });
    const returnData = data.map((e) => {
      const numberOfMember = e.userCourses.length;
      delete e.userCourses;
      return {
        ...e,
        numberOfMember,
      };
    });
    return { ...httpResponse.GET_SUCCESS, data: returnData };
  }

  async getPreferCourse(userId: number): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: { id: userId, verifyStatus: UserStatus.ACTIVE },
      relations: ['userPrefer'],
    });
    const courseMap = user.userPrefer;
    const path = [];
    if (courseMap.courseBackend) {
      path.push(Path.BACKEND);
    }
    if (courseMap.courseBasic) {
      path.push(Path.BASIC);
    }
    if (courseMap.courseFrontend) {
      path.push(Path.FRONTEND);
    }
    if (courseMap.courseFullstack) {
      path.push(Path.FULLSTACK);
    }
    if (courseMap.courseMobile) {
      path.push(Path.MOBILE);
    }
    if (courseMap.courseOther) {
      path.push(Path.OTHER);
    }
    const data = await this.courseRepository.find({
      where: {
        path: In(path),
      },
      order: {
        id: 'DESC',
      },
    });

    return { ...httpResponse.GET_SUCCESS, data };
  }

  async getOneCourse(
    courseId: number,
    userId: number | any,
  ): Promise<Response> {
    const data = await this.courseRepository.findOne(courseId, {
      relations: ['userCourses', 'lessons'],
    });

    if (!data) {
      throw new HttpException(
        httpErrors.COURSE_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
    let isRegisted: boolean;

    if (userId !== null) {
      const user = await this.userRepository.findOne({
        where: {
          id: userId,
          verifyStatus: UserStatus.ACTIVE,
        },
      });
      if (!user) {
        throw new HttpException(
          httpErrors.USER_NOT_FOUND,
          HttpStatus.NOT_FOUND,
        );
      }
      const userCourse = await this.userCourseRepository.findOne({
        where: {
          user,
          course: data,
        },
      });
      if (!userCourse) {
        isRegisted = false;
      } else {
        isRegisted = true;
      }
    } else {
      isRegisted = false;
    }

    const totalUsers = data.userCourses.length;
    const firstLesson = data.lessons.length
      ? {
          name: data.lessons[0].name,
          id: data.lessons[0].id,
          link: data.lessons[0].link,
        }
      : null;
    const lessonList = data.lessons.map((e) => {
      return { name: e.name, id: e.id };
    });
    delete data.lessons;
    delete data.userCourses;
    const responseData = {
      ...data,
      totalUsers,
      firstLesson,
      lessonList,
      isRegisted,
    };
    return { ...httpResponse.GET_SUCCESS, data: responseData };
  }

  async createCourse(body: CreateCourseDto): Promise<Response> {
    const { name } = body;
    const course = await this.courseRepository.findOne({ where: { name } });
    if (course) {
      throw new HttpException(httpErrors.COURSE_FOUND, HttpStatus.BAD_REQUEST);
    }
    await this.courseRepository.insert({ ...body });
    return { ...httpResponse.CREATE_COURSE_SUCCESS };
  }

  async updateCourse(
    body: UpdateCourseDto,
    courseId: number,
  ): Promise<Response> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new HttpException(
        httpErrors.COURSE_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.courseRepository.update(courseId, { ...body });
    return { ...httpResponse.UPDATE_COURSE_SUCCESS };
  }

  async deleteCourse(courseId: number): Promise<Response> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: ['lessons', 'userCourses'],
    });
    if (!course) {
      throw new HttpException(
        httpErrors.COURSE_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
    const lessonsIds = course.lessons.map((e) => e.id);
    const userCourseIds = course.userCourses.map((e) => e.id);
    if (lessonsIds.length > 0) {
      for (const id of lessonsIds) {
        await this.deleteLesson(id);
      }
    }
    if (userCourseIds.length > 0) {
      for (const id of userCourseIds) {
        await this.userCourseRepository.delete(id);
      }
    }

    await this.courseRepository.delete(courseId);
    return { ...httpResponse.DELETE_COURSE_SUCCESS };
  }

  async registerCourse(courseId: number, userId: number): Promise<Response> {
    const [user, course] = await Promise.all([
      this.userRepository.findOne({
        where: { id: userId, verifyStatus: UserStatus.ACTIVE },
        relations: ['userCourses'],
      }),
      this.courseRepository.findOne({
        where: {
          id: courseId,
          type: Not(CourseType.INCOMMING),
          status: CourseStatus.ACTIVE,
        },
        relations: ['lessons'],
      }),
    ]);
    const userCourseDb = await this.userCourseRepository.findOne({
      where: {
        user,
        course,
      },
    });
    if (userCourseDb) {
      throw new HttpException(
        httpErrors.COURSE_ALREADY_ENROLLED,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (!course) {
      throw new HttpException(
        httpErrors.COURSE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    if (+user.coinAvailable < course.price) {
      throw new HttpException(
        httpErrors.INSUFFICIENT_BALANCE,
        HttpStatus.BAD_REQUEST,
      );
    }
    const available = +user.coinAvailable - +course.price;
    const coin = +user.coin - +user.coin;
    const userCourse = new UserCourse();
    userCourse.user = user;
    userCourse.course = course;
    userCourse.currentLesson = course.lessons[0].id;
    await Promise.all([
      this.userRepository.update(userId, { coinAvailable: available, coin }),
      this.userCourseRepository.save(userCourse),
      this.transactionRepository.insert({
        type: TransactionType.BUY_COURSE,
        amount: course.price,
        transactionCode: null,
        time: Date.now(),
        user,
        status: TransactionStatus.PROCESSED,
      }),
    ]);
    return httpResponse.REGISTER_COURSE_SUCCES;
  }

  async isHaveCourse(courseId: number, userId: number): Promise<UserCourse> {
    const [user, course] = await Promise.all([
      this.userRepository.findOne({
        where: { id: userId, verifyStatus: UserStatus.ACTIVE },
      }),
      this.courseRepository.findOne({
        where: {
          id: courseId,
          status: CourseStatus.ACTIVE,
        },
      }),
    ]);
    const userCourse = await this.userCourseRepository.findOne({
      where: {
        user,
        course,
      },
    });

    if (!userCourse) {
      return null;
    }

    return userCourse;
  }

  async getUserCourse(userId: number): Promise<Response> {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
        verifyStatus: UserStatus.ACTIVE,
      },
    });
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    const userCourse = await this.userCourseRepository.find({
      where: {
        user,
      },
      relations: ['course'],
    });

    return { ...httpResponse.GET_SUCCESS, data: userCourse };
  }

  private async deleteLesson(lessonId: number): Promise<Response> {
    const lesson = await this.lessonRepository.findOne({
      where: { id: lessonId },
      relations: ['exercises', 'userLessons', 'course', 'course.lessons'],
    });
    if (!lesson) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const exerciesId = lesson.exercises.map((e) => e.id);
    const userLessons = lesson.userLessons.map((e) => e.id);
    if (exerciesId.length > 0) {
      for (const id of exerciesId) {
        await this.deleteExercise(id);
      }
    }
    if (userLessons.length > 0) {
      for (const id of userLessons) {
        await this.userLessonRepository.delete(id);
      }
    }
    await this.lessonRepository.delete(lessonId);
    return httpResponse.DELETE_LESSON_SUCCES;
  }
  private async deleteExercise(exerciseId: number): Promise<Response> {
    const exercise = await this.exerciseRepository.findOne({
      where: {
        id: exerciseId,
      },
      relations: ['testCases', 'userExercises'],
    });
    if (!exercise) {
      throw new HttpException(
        httpErrors.EXERCISE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const testCaseIds = exercise.testCases.map((e) => e.id);
    const userExerciseIds = exercise.userExercises.map((e) => e.id);
    const task = [];
    if (testCaseIds.length > 0) {
      task.push(this.testcaseRepository.delete([...testCaseIds]));
    }
    if (userExerciseIds.length > 0) {
      task.push(this.userExerciseRepository.delete([...userExerciseIds]));
    }

    await Promise.all([...task]);
    await this.exerciseRepository.delete(exercise.id);
    return httpResponse.DELETE_EXCERCISE_SUCCES;
  }
}

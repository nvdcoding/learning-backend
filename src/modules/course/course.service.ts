import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserCourse } from 'src/models/entities/user-course.entity';
import { CourseRepository } from 'src/models/repositories/course.repository';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import { UserCourseRepository } from 'src/models/repositories/user-course.repository';
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
  ) {}

  async getAllCourses() {
    const data = await this.courseRepository.find();
    return { ...httpResponse.GET_SUCCESS, data };
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
    });
    if (!course) {
      throw new HttpException(
        httpErrors.COURSE_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.courseRepository.softDelete(courseId);
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
}

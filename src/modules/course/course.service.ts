import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserCourse } from 'src/models/entities/user-course.entity';
import { CourseRepository } from 'src/models/repositories/course.repository';
import { UserCourseRepository } from 'src/models/repositories/user-course.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { CourseType, CourseStatus } from 'src/shares/enum/course.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { Not } from 'typeorm';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly courseRepository: CourseRepository,
    private readonly userRepository: UserRepository,
    private readonly userCourseRepository: UserCourseRepository,
  ) {}

  async getAllCourses() {
    const data = await this.courseRepository.find();
    return { ...httpResponse.GET_SUCCES, data };
  }

  async getOneCourse(courseId: number): Promise<Response> {
    const data = await this.courseRepository.findOne(courseId, {
      relations: ['userCourses', 'lessons'],
    });

    if (!data) {
      throw new HttpException(
        httpErrors.COURSE_NOT_FOUND,
        HttpStatus.BAD_REQUEST,
      );
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
    const responseData = { ...data, totalUsers, firstLesson, lessonList };
    return { ...httpResponse.GET_SUCCES, data: responseData };
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
        id: courseId,
        type: Not(CourseType.INCOMMING),
        status: CourseStatus.ACTIVE,
      }),
    ]);
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

    const available = +user.coinAvailable - course.price;
    const userCourse = new UserCourse();
    userCourse.user = user;
    userCourse.course = course;

    await Promise.all([
      this.userRepository.update(userId, { coinAvailable: `${available}` }),
      this.userCourseRepository.save(userCourse),
    ]);

    return httpResponse.REGISTER_COURSE_SUCCES;
  }

  async isHaveCourse(courseId: number, userId: number): Promise<boolean> {
    const userCourse = await this.userCourseRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
      },
    });
    if (!userCourse) {
      return false;
    }
    return true;
  }
}

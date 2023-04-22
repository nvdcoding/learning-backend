import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CourseRepository } from 'src/models/repositories/course.repository';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly courseRepository: CourseRepository) {}

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
      ? { name: data.lessons[0].name, id: data.lessons[0].id }
      : null;

    delete data.lessons;
    delete data.userCourses;
    const responseData = { ...data, totalUsers, firstLesson };
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
}

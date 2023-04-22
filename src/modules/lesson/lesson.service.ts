import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CourseRepository } from 'src/models/repositories/course.repository';
import { LessonRepository } from 'src/models/repositories/lesson.repository';
import { CourseStatus } from 'src/shares/enum/course.enum';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { In } from 'typeorm';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { GetLessonDto } from './dtos/get-lesson.dto';
import { UpdateLessonDto } from './dtos/update-lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly courseRepository: CourseRepository,
  ) {}

  async getLessonOfCourse(courseId: number, role: string) {
    if (!courseId) {
      throw new HttpException(
        httpErrors.COURSE_ID_NOT_DEFINED,
        HttpStatus.BAD_REQUEST,
      );
    }
    // check user cos course do khong
    const where = {
      id: courseId,
    };
    const course = await this.courseRepository.findOne({
      where: {
        ...where,
        status:
          role === 'admin'
            ? In([CourseStatus.ACTIVE, CourseStatus.INACTIVE])
            : CourseStatus.ACTIVE,
      },
    });
    if (!course) {
      throw new HttpException(
        httpErrors.COURSE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const data = await this.lessonRepository.find({
      course,
    });
    return { ...httpResponse.GET_SUCCES, data };
  }

  async getOneLesson(lessonId: number) {
    const data = await this.lessonRepository.find({
      id: lessonId,
    });

    return { ...httpResponse.GET_SUCCES, data };
  }

  async createLesson(body: CreateLessonDto): Promise<Response> {
    const { courseId, name, link } = body;

    const course = await this.courseRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new HttpException(
        httpErrors.COURSE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.lessonRepository.save({
      course,
      name,
      link,
    });
    return httpResponse.CREATE_LESSON_SUCCES;
  }

  async updateLesson(body: UpdateLessonDto): Promise<Response> {
    const lesson = await this.lessonRepository.findOne({
      where: {
        id: body.lessonId,
      },
    });
    if (!lesson) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.lessonRepository.update(body.lessonId, {
      name: body.name,
      link: body.name,
    });
    return httpResponse.UPDATE_LESSON_SUCCES;
  }
}

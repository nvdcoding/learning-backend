import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Lesson } from 'src/models/entities/lesson.entity';
import { CourseRepository } from 'src/models/repositories/course.repository';
import { LessonRepository } from 'src/models/repositories/lesson.repository';
import { UserCourseRepository } from 'src/models/repositories/user-course.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { CourseStatus } from 'src/shares/enum/course.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { In } from 'typeorm';
import { CourseService } from '../course/course.service';
import { CreateLessonDto } from './dtos/create-lesson.dto';
import { GetLessonDto } from './dtos/get-lesson.dto';
import { UpdateLessonDto } from './dtos/update-lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    private readonly lessonRepository: LessonRepository,
    private readonly courseRepository: CourseRepository,
    private readonly userCourseRepository: UserCourseRepository,
    private readonly courseService: CourseService,
    private readonly userRepository: UserRepository,
  ) {}

  async getLessonOfCourse(courseId: number, role: string, userId?: number) {
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
    let currentLesson = null;
    if (userId) {
      currentLesson = await this.courseService.isHaveCourse(courseId, userId);
      console.log(currentLesson);

      if (currentLesson == null) {
        throw new HttpException(
          httpErrors.USER_NOT_ENROLLED_COURSE,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const lessons = await this.lessonRepository.find({
      where: {
        course,
      },
      relations: ['exercises', 'course'],
    });
    return { ...httpResponse.GET_SUCCES, data: { lessons, currentLesson } };
  }

  async getOneLesson(lessonId: number, userId?: number) {
    const data = await this.lessonRepository.findOne(
      {
        id: lessonId,
      },
      { relations: ['exercises', 'course'] },
    );

    if (!data) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    let nextLessonId = null;
    let previousLessonId = null;
    let currentLesson = null;
    if (userId) {
      currentLesson = await this.courseService.isHaveCourse(
        data.course.id,
        userId,
      );
      const { previousLesson, nextLesson } =
        await this.getPreviousAndNextLesson(data);
      nextLessonId = nextLesson;
      previousLessonId = previousLesson;
      if (currentLesson === null) {
        throw new HttpException(
          httpErrors.USER_NOT_ENROLLED_COURSE,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (currentLesson < lessonId) {
        throw new HttpException(
          httpErrors.USER_NOT_ENROLLED_COURSE,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (data.exercises.length === 0) {
        await this.userCourseRepository.update(
          { id: userId },
          { currentLesson: nextLesson.id },
        );
      }
    }

    return {
      ...httpResponse.GET_SUCCES,
      data: { ...data, nextLessonId, previousLessonId },
    };
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

  async getPreviousAndNextLesson(lesson: Lesson) {
    const currentLessonIndex = lesson.course.lessons.findIndex(
      (lesson) => lesson.id === lesson.id,
    );
    const nextLesson = lesson.course.lessons[currentLessonIndex + 1] || null;
    const previousLesson =
      lesson.course.lessons[currentLessonIndex - 1] || null;

    return { nextLesson, previousLesson };
  }
}

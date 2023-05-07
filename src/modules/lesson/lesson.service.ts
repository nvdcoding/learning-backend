import {
  Body,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
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
    const course = await this.courseRepository.findOne({
      where: {
        id: courseId,
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

      if (currentLesson == null) {
        throw new HttpException(
          httpErrors.USER_NOT_ENROLLED_COURSE,
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const relations =
      role === 'admin'
        ? ['exercises', 'course']
        : [
            'exercises',
            'course',
            'exercises.userExercises',
            'exercises.userExercises.user',
          ];

    const lessons = await this.lessonRepository.find({
      where: {
        course,
      },
      relations,
    });
    const lessonData = lessons.map((lesson) => {
      const exercises = lesson.exercises.map((exercise) => {
        let userExerciseStatus = null;
        if (userId) {
          const userExercise = exercise.userExercises.find(
            (ue: any) => ue.user.id === userId && ue.status === true,
          );
          userExerciseStatus = userExercise ? true : false;
        }
        return {
          ...exercise,
          status: userExerciseStatus,
        };
      });

      return {
        ...lesson,
        exercises: exercises.map((e) => {
          return { ...e, userExercises: null };
        }),
      };
    });
    return {
      ...httpResponse.GET_SUCCES,
      data: { lessons: lessonData, currentLesson },
    };
  }

  async getOneLesson(lessonId: number, userId?: number) {
    const data = await this.lessonRepository.findOne({
      where: {
        id: lessonId,
      },
      relations: ['exercises', 'course', 'course.lessons'],
    });
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
          httpErrors.LESSON_LOCKED,
          HttpStatus.BAD_REQUEST,
        );
      }
      console.log('DSADASD', { ckec: data.exercises });

      if (data.exercises.length === 0) {
        await this.userCourseRepository.update(
          { id: userId },
          { currentLesson: nextLesson ? nextLesson.id : data.id },
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
      link: body.link,
    });
    return httpResponse.UPDATE_LESSON_SUCCES;
  }

  async getPreviousAndNextLesson(lesson: Lesson) {
    const currentLessonIndex = lesson.course.lessons.findIndex(
      (item) => item.id === lesson.id,
    );
    console.log({ currentLessonIndex });

    const nextLesson = lesson.course.lessons[currentLessonIndex + 1] || null;
    const previousLesson =
      lesson.course.lessons[currentLessonIndex - 1] || null;

    return { nextLesson, previousLesson };
  }

  async getCurrentLesson(courseId: number, userId: number): Promise<Response> {
    const currentLesson = await this.courseService.isHaveCourse(
      courseId,
      userId,
    );

    if (currentLesson == null) {
      throw new HttpException(
        httpErrors.USER_NOT_ENROLLED_COURSE,
        HttpStatus.BAD_REQUEST,
      );
    }
    return { ...httpResponse.GET_SUCCES, data: currentLesson };
  }
}

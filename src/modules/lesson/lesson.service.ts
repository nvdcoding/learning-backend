import {
  Body,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Lesson } from 'src/models/entities/lesson.entity';
import { CourseRepository } from 'src/models/repositories/course.repository';
import { ExcerciseRepository } from 'src/models/repositories/exercise.repository';
import { LessonRepository } from 'src/models/repositories/lesson.repository';
import { NoteRepository } from 'src/models/repositories/note.repository';
import { TestcaseRepository } from 'src/models/repositories/testcase.repository';
import { UserCourseRepository } from 'src/models/repositories/user-course.repository';
import { UserExerciseRepository } from 'src/models/repositories/user-exercise.repository';
import { UserLessonRepository } from 'src/models/repositories/user-lesson.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import { CourseStatus } from 'src/shares/enum/course.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpErrors } from 'src/shares/exceptions';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { In } from 'typeorm';
import { CourseService } from '../course/course.service';
import { ExcerciseService } from '../excercise/excercise.service';
import { CreateNoteDto } from './dtos/creaet-note.dto';
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
    private readonly noteRepository: NoteRepository,
    private readonly userLessonRepository: UserLessonRepository,
    private readonly exerciseRepository: ExcerciseRepository,
    private readonly userExerciseRepository: UserExerciseRepository,
    private readonly testcaseRepository: TestcaseRepository,
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
      ...httpResponse.GET_SUCCESS,
      data: { lessons: lessonData, currentLesson },
    };
  }

  async getOneLesson(lessonId: number, userId?: number) {
    const lesson = await this.lessonRepository.findOne({
      where: {
        id: lessonId,
      },
      relations: ['exercises', 'course', 'course.lessons'],
    });
    if (!lesson) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    let nextLessonId = null;
    let previousLessonId = null;
    // let currentLesson = null;
    if (userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId, verifyStatus: UserStatus.ACTIVE },
      });
      const userLesson = await this.userLessonRepository.findOne({
        where: { lesson, user },
      });
      const userCourse = await this.userCourseRepository.findOne({
        user,
        course: {
          id: lesson.course.id,
        },
      });
      if (!userLesson) {
        await this.userLessonRepository.insert({
          user,
          lesson,
          isDone: false,
        });
      }
      const res = await this.courseService.isHaveCourse(
        lesson.course.id,
        userId,
      );
      const { previousLesson, nextLesson } =
        await this.getPreviousAndNextLesson(lesson);
      nextLessonId = nextLesson;
      previousLessonId = previousLesson;
      if (res.currentLesson === null) {
        throw new HttpException(
          httpErrors.USER_NOT_ENROLLED_COURSE,
          HttpStatus.BAD_REQUEST,
        );
      }
      if (res.currentLesson < lessonId) {
        throw new HttpException(
          httpErrors.LESSON_LOCKED,
          HttpStatus.BAD_REQUEST,
        );
      }
      console.log('DSADASD', { ckec: lesson.exercises });

      if (
        userCourse.currentLesson === lesson.id &&
        lesson.exercises.length === 0
      ) {
        await this.userCourseRepository.update(
          { id: res.id },
          { currentLesson: nextLesson ? nextLesson.id : lesson.id },
        );
      }
    }

    return {
      ...httpResponse.GET_SUCCESS,
      data: { ...lesson, nextLessonId, previousLessonId },
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
    const lastLesson = await this.lessonRepository.findOne({
      where: { course },
      order: {
        id: 'DESC',
      },
      relations: ['exercises', 'course'],
    });

    const savedLesson = await this.lessonRepository.save({
      course,
      name,
      link,
    });
    if (!lastLesson) {
      return httpResponse.CREATE_LESSON_SUCCES;
    }
    const lastLessonId = lastLesson?.id;
    if (lastLesson.exercises.length == 0) {
      await this.userCourseRepository.update(
        { currentLesson: lastLessonId },
        {
          currentLesson: savedLesson.id,
        },
      );
    } else {
      const userLesson = await this.userLessonRepository.find({
        where: {
          isDone: true,
          lesson: {
            id: lastLessonId,
          },
        },
        relations: ['user'],
      });
      if (!userLesson) {
        return;
      }
      const userDoneLesson = userLesson.map((e) => e.user.id);
      await this.userCourseRepository.update(
        {
          user: {
            id: In(userDoneLesson),
          },
          course: {
            id: lastLesson.course.id,
          },
        },
        {
          currentLesson: savedLesson.id,
        },
      );
    }
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
    return { ...httpResponse.GET_SUCCESS, data: currentLesson };
  }

  async createNote(body: CreateNoteDto, userId: number): Promise<Response> {
    const [user, lesson] = await Promise.all([
      this.userRepository.findOne({
        where: {
          id: userId,
          verifyStatus: UserStatus.ACTIVE,
        },
      }),
      this.lessonRepository.findOne({ where: { id: body.lessonId } }),
    ]);
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (!lesson) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const userLesson = await this.userLessonRepository.findOne({
      where: {
        user,
        lesson,
      },
    });
    if (!userLesson) {
      throw new HttpException(httpErrors.USER_EXIST, HttpStatus.NOT_FOUND);
    }
    await this.noteRepository.insert({
      userLesson,
      notes: body.notes,
      seconds: body.second ? body.second : null,
    });
    return httpResponse.CREATE_NOTE_SUCCESS;
  }

  async getLessonNote(lessonId: number, userId: number): Promise<Response> {
    const [user, lesson] = await Promise.all([
      this.userRepository.findOne({
        where: {
          id: userId,
          verifyStatus: UserStatus.ACTIVE,
        },
      }),
      this.lessonRepository.findOne({ where: { id: lessonId } }),
    ]);
    if (!user) {
      throw new HttpException(httpErrors.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    if (!lesson) {
      throw new HttpException(
        httpErrors.LESSON_NOT_FOUND,
        HttpStatus.NOT_FOUND,
      );
    }
    const userLesson = await this.userLessonRepository.findOne({
      where: {
        user,
        lesson,
      },
    });
    if (!userLesson) {
      throw new HttpException(httpErrors.USER_EXIST, HttpStatus.NOT_FOUND);
    }
    const notes = await this.noteRepository.find({
      where: {
        userLesson,
      },
    });
    return { ...httpResponse.GET_NOTE_SUCCESS, data: notes };
  }

  async deleteLesson(lessonId: number): Promise<Response> {
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

    if (lesson.course.lessons.length === 1) {
      throw new HttpException(
        httpErrors.CANT_DELETE_LESSON,
        HttpStatus.BAD_REQUEST,
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

    const { nextLesson, previousLesson } = await this.getPreviousAndNextLesson(
      lesson,
    );
    const lastLessonId =
      lesson.course.lessons[lesson.course.lessons.length - 1].id;
    if (lastLessonId === lessonId) {
      await this.userCourseRepository.update(
        { currentLesson: lessonId },
        { currentLesson: previousLesson.id },
      );
    } else {
      await this.userCourseRepository.update(
        { currentLesson: lessonId },
        { currentLesson: nextLesson.id },
      );
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

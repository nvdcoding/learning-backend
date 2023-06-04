import { Injectable } from '@nestjs/common';
import { CommentRepository } from 'src/models/repositories/comment.repository';
import { CourseRepository } from 'src/models/repositories/course.repository';
import { ExcerciseRepository } from 'src/models/repositories/exercise.repository';
import { LessonRepository } from 'src/models/repositories/lesson.repository';
import { PostRepository } from 'src/models/repositories/post.repository';
import { TransactionRepository } from 'src/models/repositories/transaction.repository';
import { UserCourseRepository } from 'src/models/repositories/user-course.repository';
import { UserRepository } from 'src/models/repositories/user.repository';
import {
  BasePaginationRequestDto,
  BasePaginationResponseDto,
} from 'src/shares/dtos/base-pagination.dto';
import { CourseStatus } from 'src/shares/enum/course.enum';
import { PostStatus } from 'src/shares/enum/post.enum';
import { UserStatus } from 'src/shares/enum/user.enum';
import { httpResponse } from 'src/shares/response';
import { Response } from 'src/shares/response/response.interface';
import { In } from 'typeorm';

@Injectable()
export class StatisticService {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository,
    private readonly lessonRepository: LessonRepository,
    private readonly courseRepository: CourseRepository,
    private readonly commentRepository: CommentRepository,
    private readonly exerciseRepository: ExcerciseRepository,
    private readonly userCourseRepository: UserCourseRepository,
  ) {}

  async getTransactions(options: BasePaginationRequestDto): Promise<Response> {
    const { limit, page } = options;
    const transactions = await this.transactionRepository.findAndCount({
      order: { id: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      ...httpResponse.GET_SUCCESS,
      data: BasePaginationResponseDto.convertToPaginationWithTotalPages(
        transactions,
        page,
        limit,
      ),
    };
  }

  async getInfoSystem(): Promise<Response> {
    const [posts, users, courses, lessons, comments, exercises] =
      await Promise.all([
        this.postRepository.count({
          where: { status: In([PostStatus.ACTIVE, PostStatus.WAITING]) },
        }),
        this.userRepository.count({
          where: { verifyStatus: UserStatus.ACTIVE },
        }),
        this.courseRepository.count({ where: { status: CourseStatus.ACTIVE } }),
        this.lessonRepository.count(),
        this.commentRepository.count(),
        this.exerciseRepository.count(),
      ]);
    return {
      ...httpResponse.GET_SUCCESS,
      data: {
        posts,
        users,
        courses,
        lessons,
        comments,
        exercises,
      },
    };
  }

  async getChartCourse(): Promise<Response> {
    const counts = await this.userCourseRepository
      .createQueryBuilder('userCourse')
      .select('userCourse.course.id', 'courseId')
      .addSelect('course.name', 'name')
      .addSelect('COUNT(userCourse.id)', 'count')
      .groupBy('userCourse.course.id')
      .leftJoinAndSelect('userCourse.course', 'course')
      .orderBy('count', 'DESC')
      .take(5)
      .getRawMany();

    return {
      ...httpResponse.GET_SUCCESS,
      data: counts.map((e) => {
        return [e.name, +e.count];
      }),
    };
  }
}

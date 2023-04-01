import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRepository } from './repositories/admin.repository';
import { CommentRepository } from './repositories/comment.repository';
import { CourseRepository } from './repositories/course.repository';
import { ExcerciseRepository } from './repositories/exercise.repository';
import { LessonRepository } from './repositories/lesson.repository';
import { NoteRepository } from './repositories/note.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { PostRepository } from './repositories/post.repository';
import { ReportRepository } from './repositories/report.repository';
import { TestcaseRepository } from './repositories/testcase.repository';
import { TransactionRepository } from './repositories/transaction.repository';
import { UserCourseRepository } from './repositories/user-course.repository';
import { UserExerciseRepository } from './repositories/user-exercise.repository';
import { UserLessonRepository } from './repositories/user-lesson.repository';
import { UserRepository } from './repositories/user.repository';

const commonRepositories = [
  AdminRepository,
  CommentRepository,
  CourseRepository,
  ExcerciseRepository,
  LessonRepository,
  NoteRepository,
  PermissionRepository,
  PostRepository,
  ReportRepository,
  TestcaseRepository,
  TransactionRepository,
  UserCourseRepository,
  UserLessonRepository,
  UserExerciseRepository,
  UserRepository,
];

@Global()
@Module({
  imports: [TypeOrmModule.forFeature(commonRepositories)],
  exports: [TypeOrmModule],
})
export class DatabaseCommonModule {}

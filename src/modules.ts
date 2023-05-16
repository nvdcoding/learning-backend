import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { BullModule } from '@nestjs/bull';
import { CacheModule, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-redis-store';
import { CommandModule } from 'nestjs-command';
import { DatabaseCommonModule } from 'src/models/database-common';
import { redisConfig } from './configs/redis.config';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CommentModule } from './modules/comment/comment.module';
import { CourseModule } from './modules/course/course.module';
import { ExcerciseModule } from './modules/excercise/excercise.module';
import { LessonModule } from './modules/lesson/lesson.module';
import { MailModule } from './modules/mail/mail.module';
import { PermissionModule } from './modules/permission/permission.module';
import { PostModule } from './modules/post/post.module';
import { ReportModule } from './modules/report/report.module';
import { UserModule } from './modules/user/user.module';
const Modules = [
  Logger,
  TypeOrmModule.forRoot(),
  CommandModule,
  DatabaseCommonModule,
  ConfigModule.forRoot(),
  CacheModule.register({
    store: redisStore,
    ...redisConfig,
    isGlobal: true,
  }),
  BullModule.forRoot({
    redis: redisConfig,
  }),
  MailModule,
  AuthModule,
  CourseModule,
  UserModule,
  AdminModule,
  LessonModule,
  ExcerciseModule,
  PermissionModule,
  PostModule,
  CommentModule,
  ReportModule,
];
export default Modules;

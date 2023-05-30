import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AdminModule } from '../admin/admin.module';
import { CourseModule } from '../course/course.module';
import { ExcerciseModule } from '../excercise/excercise.module';
import { ExcerciseService } from '../excercise/excercise.service';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';

@Module({
  imports: [
    AdminModule,
    UserModule,
    CourseModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, MailModule],
      useFactory: (configService: ConfigService) =>
        ({
          secret: configService.get('SECRET_JWT'),
          signOptions: {
            expiresIn: '1d',
          },
        } as JwtModuleOptions),
      inject: [ConfigService],
    }),
  ],
  providers: [LessonService],
  controllers: [LessonController],
  exports: [LessonService],
})
export class LessonModule {}

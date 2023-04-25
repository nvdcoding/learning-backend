import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AdminModule } from '../admin/admin.module';
import { CourseModule } from '../course/course.module';
import { MailModule } from '../mail/mail.module';
import { UserModule } from '../user/user.module';
import { ExcerciseController } from './excercise.controller';
import { ExcerciseService } from './excercise.service';
import { HttpModule } from '@nestjs/axios';
import { LessonModule } from '../lesson/lesson.module';
@Module({
  imports: [
    UserModule,
    AdminModule,
    CourseModule,
    LessonModule,
    HttpModule,
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
  providers: [ExcerciseService],
  controllers: [ExcerciseController],
})
export class ExcerciseModule {}

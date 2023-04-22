import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class RegisterCourseDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUrl } from 'class-validator';

export class CreateLessonDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsUrl()
  @IsNotEmpty()
  link: string;
}

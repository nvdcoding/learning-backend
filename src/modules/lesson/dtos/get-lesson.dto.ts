import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class GetLessonDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  courseId: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetLessonDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseId: number;
}

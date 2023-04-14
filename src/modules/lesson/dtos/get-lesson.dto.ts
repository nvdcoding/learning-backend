import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional } from 'class-validator';

export class GetLessonDto {
  @ApiProperty()
  @IsNumber()
  @IsOptional()
  courseId: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  lessonId: number;
}

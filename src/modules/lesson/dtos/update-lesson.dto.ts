import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsUrl } from 'class-validator';

export class UpdateLessonDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  lessonId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  link: string;
}

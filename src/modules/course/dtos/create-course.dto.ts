import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import {
  CourseLanguage,
  CourseLevel,
  CourseType,
  Path,
} from 'src/shares/enum/course.enum';

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  goal: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  img: string;

  @ApiProperty()
  @IsEnum(Path)
  @IsNotEmpty()
  path: Path;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requirement: string;

  @ApiProperty()
  @IsEnum(CourseType)
  @IsNotEmpty()
  type: CourseType;

  @ApiProperty()
  @IsEnum(CourseLevel)
  @IsNotEmpty()
  level: CourseLevel;

  @ApiProperty()
  @IsEnum(CourseLanguage)
  @IsNotEmpty()
  language: CourseLanguage;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  price: number;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber } from 'class-validator';
import { CourseStatus, CourseType, Path } from 'src/shares/enum/course.enum';

export class UpdateCourseDto {
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
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsEnum(CourseType)
  @IsNotEmpty()
  type: CourseType;

  @ApiProperty()
  @IsEnum(CourseStatus)
  @IsNotEmpty()
  status: CourseStatus;
}
